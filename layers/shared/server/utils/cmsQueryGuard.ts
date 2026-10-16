import { createError } from 'h3'

/**
 * Relation-aware checks for the CMS proxy (server/api/cms/[...].ts).
 *
 * Blocking a collection by name at the top of the URL isn't enough: Directus
 * follows relations in `fields`, `filter`, `deep`, `sort`… and accepts nested
 * relational payloads on writes. With the proxy's static token,
 *   GET /items/cities?fields=users.users_id.*
 * would read the auth `users` table through the cities → users junction, and
 *   PATCH /items/<anything>/1 { "<relation>": { … } }
 * would write whatever that relation points at. So every relation path a
 * non-admin request touches is walked against Directus' relation graph and
 * refused when it reaches a protected collection.
 */

export interface RelationGraph {
  /** `${collection}.${field}` → collections that field leads to. */
  edges: Map<string, string[]>
  /** `${collection}.${field}` of m2m/m2a aliases, which lead into a junction. */
  junctionAliases: Set<string>
  /** `${collection}.${field}` of o2m aliases: setting them rewrites rows of the *other* collection. */
  o2mAliases: Set<string>
  /** Relational fields per collection (for `*` in field paths). */
  byCollection: Map<string, string[]>
}

interface DirectusRelation {
  collection: string
  field: string
  related_collection: string | null
  meta?: { one_field?: string | null; junction_field?: string | null; one_allowed_collections?: string[] | null } | null
}

const TTL_MS = 5 * 60_000
let cached: { at: number; graph: Promise<RelationGraph> } | null = null

export function loadRelationGraph(directusUrl: string, token: string | undefined): Promise<RelationGraph> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.graph
  const graph = $fetch<{ data: DirectusRelation[] }>(`${directusUrl.replace(/\/$/, '')}/relations`, {
    headers: { authorization: token ? `Bearer ${token}` : '' },
    query: { limit: -1 },
  }).then(({ data }) => buildRelationGraph(data))
  cached = { at: Date.now(), graph }
  // Don't keep a failed load around — fail closed now, retry next request.
  graph.catch(() => { if (cached?.graph === graph) cached = null })
  return graph
}

export function buildRelationGraph(relations: DirectusRelation[]): RelationGraph {
  const edges = new Map<string, string[]>()
  const junctionAliases = new Set<string>()
  const o2mAliases = new Set<string>()
  const byCollection = new Map<string, string[]>()
  const add = (collection: string, field: string, targets: string[]) => {
    const key = `${collection}.${field}`
    edges.set(key, [...new Set([...(edges.get(key) ?? []), ...targets])])
    const fields = byCollection.get(collection) ?? []
    if (!fields.includes(field)) byCollection.set(collection, [...fields, field])
  }
  for (const r of relations) {
    // many → one (m2o), or many-to-any when there's no single related collection
    const ones = r.related_collection ? [r.related_collection] : (r.meta?.one_allowed_collections ?? [])
    if (ones.length) add(r.collection, r.field, ones)
    // one → many (o2m alias). With a junction_field this is the m2m/m2a alias.
    if (r.related_collection && r.meta?.one_field) {
      add(r.related_collection, r.meta.one_field, [r.collection])
      o2mAliases.add(`${r.related_collection}.${r.meta.one_field}`)
      if (r.meta.junction_field) junctionAliases.add(`${r.related_collection}.${r.meta.one_field}`)
    }
  }
  return { edges, junctionAliases, o2mAliases, byCollection }
}

export interface GuardRules {
  /** May this request reach `collection` through a relation? */
  canReach: (collection: string) => boolean
  /** Admins edit site content with nested relational payloads. */
  allowNestedWrites?: boolean
}

const forbidden = (message: string) => createError({ statusCode: 403, statusMessage: message })
const badRequest = (message: string) => createError({ statusCode: 400, statusMessage: message })

const MAX_DEPTH = 8
// `count(items)`, `year(date_created)`, `json(data, a.b)` → the field inside.
const unwrapFunction = (segment: string) => segment.match(/^\w+\(([^,)]+)/)?.[1]?.trim() ?? segment

/** Walks one dotted field path (`a.b.c`, `item:products.name`, `*.*`). */
function checkPath(graph: RelationGraph, rules: GuardRules, collection: string, segments: string[], depth = 0): void {
  if (!segments.length) return
  if (depth > MAX_DEPTH) throw badRequest('Field path is too deep')
  const [raw, ...rest] = segments
  const segment = unwrapFunction(raw!.trim())
  if (!segment) return
  if (segment.startsWith('$')) throw forbidden('This query feature is not available through the CMS proxy')

  const fields = segment === '*' ? (rest.length ? graph.byCollection.get(collection) ?? [] : []) : [segment]
  for (const entry of fields) {
    const [field, only] = entry.split(':') as [string, string | undefined]
    const targets = graph.edges.get(`${collection}.${field}`)
    if (!targets) {
      // Not a relation: fine as a leaf, but nothing can follow it — except
      // `*` (`menus.*` on a JSON repeater field), which Directus answers
      // with the field's own value.
      if (rest.length && segment !== '*' && !rest.every((s) => s.trim() === '*')) {
        throw badRequest(`"${field}" is not a relation of ${collection}`)
      }
      continue
    }
    // A leaf (`fields=user_id`) is just the foreign-key value; only
    // following it (`user_id.email`) reads the related collection.
    if (!rest.length) continue
    for (const target of only ? targets.filter((t) => t === only) : targets) {
      if (!rules.canReach(target)) throw forbidden(`${collection}.${field} is not available through the CMS proxy`)
      checkPath(graph, rules, target, rest, depth + 1)
    }
  }
}

const listOf = (value: unknown): string[] =>
  Array.isArray(value) ? value.flatMap(listOf)
    : typeof value === 'string' ? value.split(',').map((s) => s.trim()).filter(Boolean)
      : []

const jsonOf = (value: unknown): unknown => {
  // `filter=…&filter[x]=…` parses to an array that Directus would read
  // differently from this walk — refuse it rather than guess.
  if (Array.isArray(value)) throw badRequest('Repeated query parameter')
  if (typeof value !== 'string') return value
  try { return JSON.parse(value) } catch { throw badRequest('Malformed query parameter') }
}

function checkFields(graph: RelationGraph, rules: GuardRules, collection: string, value: unknown, stripSortSign = false) {
  for (const path of listOf(value)) {
    checkPath(graph, rules, collection, (stripSortSign ? path.replace(/^-/, '') : path).split('.'))
  }
}

function checkFilter(graph: RelationGraph, rules: GuardRules, collection: string, filter: unknown, depth = 0): void {
  if (depth > MAX_DEPTH * 2) throw badRequest('Filter is too deep')
  if (Array.isArray(filter)) { filter.forEach((f) => checkFilter(graph, rules, collection, f, depth + 1)); return }
  if (!filter || typeof filter !== 'object') return
  for (const [key, value] of Object.entries(filter as Record<string, unknown>)) {
    if (key.startsWith('$')) throw forbidden('This query feature is not available through the CMS proxy')
    if (key === '_and' || key === '_or' || key === '_some' || key === '_none') {
      checkFilter(graph, rules, collection, value, depth + 1)
      continue
    }
    if (key.startsWith('_')) continue // an operator (`_eq`, `_in`, …): its value is data
    const field = unwrapFunction(key)
    const targets = graph.edges.get(`${collection}.${field}`)
    if (!targets) continue
    // `{ user_id: { _eq: id } }` compares the foreign key itself; only a
    // nested field (or `_some`/`_none`) actually reads the related rows.
    const traverses = !!value && typeof value === 'object' && Object.keys(value).some(
      (k) => !k.startsWith('_') || k === '_some' || k === '_none')
    if (!traverses) continue
    for (const target of targets) {
      if (!rules.canReach(target)) throw forbidden(`${collection}.${field} is not available through the CMS proxy`)
      checkFilter(graph, rules, target, value, depth + 1)
    }
  }
}

function checkDeep(graph: RelationGraph, rules: GuardRules, collection: string, deep: unknown, depth = 0): void {
  if (!deep || typeof deep !== 'object' || Array.isArray(deep)) return
  if (depth > MAX_DEPTH) throw badRequest('Deep query is too deep')
  for (const [key, value] of Object.entries(deep as Record<string, unknown>)) {
    if (key.startsWith('_')) continue // handled by the caller for this level
    const [field, only] = key.split(':') as [string, string | undefined]
    const targets = graph.edges.get(`${collection}.${field}`)
    if (!targets) continue
    for (const target of only ? targets.filter((t) => t === only) : targets) {
      if (!rules.canReach(target)) throw forbidden(`${collection}.${field} is not available through the CMS proxy`)
      const level = (value ?? {}) as Record<string, unknown>
      checkFilter(graph, rules, target, jsonOf(level._filter))
      checkFields(graph, rules, target, level._fields)
      checkFields(graph, rules, target, level._sort, true)
      checkDeep(graph, rules, target, level, depth + 1)
    }
  }
}

/** Checks every relation path a read query touches. `query` is qs-parsed. */
export function checkReadQuery(graph: RelationGraph, rules: GuardRules, collection: string, query: Record<string, unknown>) {
  // `alias` renames fields, which would let a path dodge the walk below.
  if (query.alias !== undefined) throw forbidden('Field aliases are not available through the CMS proxy')
  checkFields(graph, rules, collection, query.fields)
  checkFields(graph, rules, collection, query.sort, true)
  checkFields(graph, rules, collection, query.groupBy)
  const aggregate = jsonOf(query.aggregate)
  if (aggregate && typeof aggregate === 'object') {
    for (const value of Object.values(aggregate)) checkFields(graph, rules, collection, value)
  }
  checkFilter(graph, rules, collection, jsonOf(query.filter))
  checkDeep(graph, rules, collection, jsonOf(query.deep))
}

const isPlainObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

/**
 * Checks a write payload. Relational values may only be ids (link to an
 * existing row) — except for m2m/m2a aliases, whose junction rows may be
 * written inline as long as *their* relations are ids again. Anything else
 * would be a nested write into another collection that skips that
 * collection's own ownership / admin checks.
 */
export function checkWritePayload(graph: RelationGraph, rules: GuardRules, collection: string, payload: unknown, inJunction = false): void {
  if (Array.isArray(payload)) { payload.forEach((p) => checkWritePayload(graph, rules, collection, p, inJunction)); return }
  if (!isPlainObject(payload)) return
  if (rules.allowNestedWrites) {
    // Admins may write nested rows, but still never into a protected collection.
    for (const [field, value] of Object.entries(payload)) {
      const targets = graph.edges.get(`${collection}.${field}`)
      if (!targets || value === null || (typeof value !== 'object' && !graph.o2mAliases.has(`${collection}.${field}`))) continue
      for (const target of targets) {
        if (!rules.canReach(target)) throw forbidden(`${collection}.${field} is not available through the CMS proxy`)
        checkWritePayload(graph, rules, target, isPlainObject(value) && ['create', 'update'].some((k) => k in value)
          ? [...listOfItems(value.create), ...listOfItems(value.update)] : value)
      }
    }
    return
  }
  if (!isPlainObject(payload)) return
  for (const [field, value] of Object.entries(payload)) {
    const key = `${collection}.${field}`
    const targets = graph.edges.get(key)
    if (!targets || value === null || value === undefined) continue
    // A plain id on an m2o just sets this row's foreign key. Anything else —
    // nested objects, or ids on an o2m alias (which re-point the *other*
    // collection's rows at this one) — writes the related collection.
    const writesTarget = typeof value === 'object' || graph.o2mAliases.has(key)
    if (writesTarget) {
      for (const target of targets) {
        if (!rules.canReach(target)) throw forbidden(`${key} is not available through the CMS proxy`)
      }
    }
    // Directus' "detailed" o2m/m2m form: { create: [], update: [], delete: [] }
    const items = isPlainObject(value) && ['create', 'update', 'delete'].some((k) => k in value)
      ? [...listOfItems(value.create), ...listOfItems(value.update)]
      : Array.isArray(value) ? value : [value]
    const nested = items.filter((item) => typeof item === 'object' && item !== null)
    if (!nested.length) continue
    if (inJunction || !graph.junctionAliases.has(key)) {
      throw forbidden(`Nested writes through ${key} are not available through the CMS proxy`)
    }
    for (const target of targets) checkWritePayload(graph, rules, target, nested, true)
  }
}

const listOfItems = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
