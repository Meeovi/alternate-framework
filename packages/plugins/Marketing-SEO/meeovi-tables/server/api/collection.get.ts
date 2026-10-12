import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3'
import type { MeeoviTableField, MeeoviTableResponse } from '../../runtime/types'
import { availableSources, sourceCollection } from '../sources'
import { directusSchema, secretFields } from '../sources/directus'
import { assertAccess, canEditRows, collectionOptions, readFilter, sessionUser, tablesConfig } from '../utils/access'

const NAME = /^[A-Za-z0-9_-]{1,64}$/

function int(value: unknown, fallback: number) {
  const n = Math.trunc(Number(value))
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/** Column schema guessed from the rows, when Directus has none. */
function schemaFromRows(rows: Record<string, unknown>[]): MeeoviTableField[] {
  const keys = new Map<string, unknown>()
  for (const row of rows.slice(0, 50)) for (const [k, v] of Object.entries(row)) if (!keys.has(k) || keys.get(k) == null) keys.set(k, v)
  return [...keys].map(([field, sample]) => ({
    field,
    label: field === 'id' ? 'ID' : field.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    type: typeof sample === 'number' ? 'number'
      : typeof sample === 'boolean' ? 'boolean'
        : sample && typeof sample === 'object' ? 'json'
          : 'string',
    sortable: true,
  }))
}

export default defineEventHandler(async (event): Promise<MeeoviTableResponse> => {
  const collection = getRouterParam(event, 'collection') ?? ''
  if (!NAME.test(collection)) throw createError({ statusCode: 400, statusMessage: 'Invalid table name' })

  const options = collectionOptions(event, collection)
  const viewer = await assertAccess(event, options)
  // Directus collection behind the table, and the rows this viewer may see.
  const target = sourceCollection(collection, options)
  const filter = readFilter(options, viewer)

  const config = tablesConfig(event)
  const q = getQuery(event)
  const page = int(q.page, 1)
  const pageSize = Math.min(int(q.pageSize, config.pageSize), config.maxPageSize)
  const search = typeof q.search === 'string' && q.search.trim() ? q.search.trim().slice(0, 200) : undefined

  const label = options.label || collection.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  // Shown to people instead of an empty grid; the technical reason is logged.
  const emptyNotice = (reason: string) => {
    console.info(`[meeovi-tables] "${collection}": ${reason}`)
    return options.unavailableNotice || `No ${label.toLowerCase()} yet.`
  }
  const available = await availableSources(collection, options)
  if (!available.length) {
    // Adapter-only tables (`fallback: false`) wait for an adapter that
    // provides them: an empty table with a notice, not an error page.
    if (options.fallback === false) {
      return {
        collection, label, source: '', sources: [], schemaSource: 'rows', schema: [], rows: [], total: 0,
        page, pageSize, sort: null, search: null, canEdit: false, primaryKey: 'id',
        notice: emptyNotice('no installed commerce adapter provides it'),
      }
    }
    throw createError({ statusCode: 503, statusMessage: `No data source can serve "${collection}" — install an adapter or configure Directus` })
  }
  const requested = (typeof q.source === 'string' && q.source) || options.source || 'auto'
  let source = requested === 'auto' ? available[0]! : available.find((s) => s.id === requested)
  if (!source) {
    throw createError({ statusCode: 400, statusMessage: `Source "${requested}" can't serve "${collection}" (available: ${available.map((s) => s.id).join(', ')})` })
  }

  // Columns: the source's own schema if it has one, else Directus (the
  // fallback schema — adapters return Directus-shaped rows).
  const secrets = await secretFields(target)
  let schema = (await source.schema?.(target)) ?? (await directusSchema(target))
  const schemaSource: MeeoviTableResponse['schemaSource'] = schema ? 'directus' : 'rows'

  // Directus serving a collection it doesn't have (no schema) would answer
  // 403 on every request — show a notice instead until it's created.
  if (source.id === 'directus' && !schema) {
    return {
      collection, label, source: source.id, sources: available.map((s) => ({ id: s.id, label: s.label })),
      schemaSource: 'rows', schema: [], rows: [], total: 0, page, pageSize, sort: null, search: null,
      canEdit: false, primaryKey: 'id',
      notice: emptyNotice(`no "${target}" collection in Directus`),
    }
  }
  schema = schema?.filter((f) => !secrets.has(f.field))
    // The owner field is stamped by the server — never editable.
    .map((f) => (f.field === options.owner ? { ...f, readonly: true, hidden: true }
      : f.field === options.ownerName || options.readonlyFields?.includes(f.field) ? { ...f, readonly: true }
        : f)) ?? null

  // Fields actually returned: the configured allowlist, else the schema's
  // (non-relational) fields, else whatever the source returns.
  // Directus answers 403 for any field that doesn't exist, so a configured
  // field missing from the schema is dropped rather than breaking the table.
  const known = schema ? new Set(schema.map((f) => f.field)) : null
  const allow = options.fields?.length
    ? options.fields.filter((f) => !secrets.has(f) && (!known || known.has(f)))
    : undefined
  const fields = allow ?? schema?.map((f) => f.field)

  // Sort only on a returned field ('-field' = descending).
  const rawSort = (typeof q.sort === 'string' && q.sort) || options.sort || ''
  const sortKey = rawSort.replace(/^-/, '')
  const sort = sortKey && (!fields || fields.includes(sortKey)) && NAME.test(sortKey) ? rawSort : undefined

  // In 'auto' mode a failing source falls through to the next one (ending
  // at Directus); an explicitly requested source reports its own error.
  const candidates = requested === 'auto' ? available : [source]
  let result
  let lastError: any
  for (const candidate of candidates) {
    try {
      result = await candidate.list({ collection: target, page, pageSize, sort, search, fields, filter })
      source = candidate
      break
    } catch (error: any) {
      lastError = error
      console.warn(`[meeovi-tables] ${candidate.id} couldn't load "${collection}":`, error?.message || error)
    }
  }
  if (!result) {
    throw createError({ statusCode: 502, statusMessage: `${source.label} couldn't load "${collection}": ${lastError?.statusMessage || lastError?.message || 'request failed'}` })
  }

  const rows = result.rows.map((row) => {
    const clean: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(row)) if (!secrets.has(k) && (!allow || allow.includes(k))) clean[k] = v
    return clean
  })

  let columns = schema
  if (columns && allow) columns = columns.filter((f) => allow.includes(f.field))
  // Adapter rows only carry some of the Directus fields — show those.
  if (columns && rows.length && source.id !== 'directus') {
    const present = new Set(rows.flatMap((r) => Object.keys(r)))
    const shown = columns.filter((f) => present.has(f.field))
    columns = shown.length ? shown : null
  }

  const user = viewer ?? (options.editRoles?.length ? await sessionUser(event) : null)
  const primaryKey = schema?.find((f) => f.primary)?.field ?? 'id'

  return {
    collection,
    label,
    source: source.id,
    sources: available.map((s) => ({ id: s.id, label: s.label })),
    schemaSource: columns ? schemaSource : 'rows',
    schema: columns ?? schemaFromRows(rows),
    rows,
    total: result.total,
    page,
    pageSize,
    sort: sort ?? null,
    search: search ?? null,
    canEdit: canEditRows(options, user) && typeof source.update === 'function',
    primaryKey,
  }
})
