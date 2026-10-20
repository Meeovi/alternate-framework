/**
 * Private content: rows only their owner may see. Applied to every
 * non-admin read through the /api/cms proxy (and so to server-rendered
 * pages too, which read these collections through it — see
 * layers/commerce/app/plugins/directus.ts).
 *
 * `hidden`: the field and the values that make a row private.
 * `owner`: the filter matching rows the user owns (or, for a space, belongs
 * to). Owner columns hold the app user's id (better-auth), like the proxy's
 * USER_WRITABLE owners.
 */

type Filter = Record<string, unknown>

const PRIVATE_CONTENT: Record<string, { hidden: { field: string, values: string[] }, owner: (userId: string) => Filter }> = {
  lists: {
    hidden: { field: 'status', values: ['Private', 'Space-only'] },
    owner: (id) => ({ user: { user_id: { _eq: id } } }),
  },
  posts: {
    // Unpublished posts are their author's alone too.
    hidden: { field: 'status', values: ['Private', 'draft', 'in_review', 'scheduled'] },
    owner: (id) => ({ creator_id: { _eq: id } }),
  },
  spaces: {
    // A private or hidden space is visible to its owner and its members.
    hidden: { field: 'status', values: ['Private', 'Hidden'] },
    owner: (id) => ({ _or: [{ owner: { _eq: id } }, { members: { directus_users_id: { _eq: id } } }] }),
  },
  websites: {
    hidden: { field: 'status', values: ['private'] },
    owner: (id) => ({ creator: { _eq: id } }),
  },
  showcases: {
    hidden: { field: 'status', values: ['Private'] },
    owner: (id) => ({ owner: { _eq: id } }),
  },
  videos: {
    hidden: { field: 'visibility', values: ['private', 'follower-only'] },
    owner: (id) => ({ user: { _eq: id } }),
  },
}

/**
 * Rows that belong to private-capable parents: visible when every parent
 * is (a link between a list and a space needs both).
 */
const PRIVATE_CHILDREN: Record<string, { parent: string, field: string }[]> = {
  list_items: [{ parent: 'lists', field: 'list_id' }],
  lists_products: [{ parent: 'lists', field: 'lists_id' }],
  lists_backend_products: [{ parent: 'lists', field: 'lists_id' }],
  lists_type_lists: [{ parent: 'lists', field: 'lists_id' }],
  lists_shorts: [{ parent: 'lists', field: 'lists_id' }],
  spaces_lists: [{ parent: 'lists', field: 'lists_id' }, { parent: 'spaces', field: 'spaces_id' }],
}

/** Collections whose reads must go through privacy checks. */
export const PRIVATE_CONTENT_COLLECTIONS = new Set([...Object.keys(PRIVATE_CONTENT), ...Object.keys(PRIVATE_CHILDREN)])

function own<T>(map: Record<string, T>, key: string): T | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined
}

/** The parts of cmsQueryGuard's RelationGraph this needs. */
type Relations = {
  edges: Map<string, string[]>
  o2mAliases: Set<string>
  byCollection: Map<string, string[]>
}

const unwrapFunction = (segment: string) => segment.match(/^\w+\(([^,)]+)/)?.[1]?.trim() ?? segment
const listOf = (value: unknown): string[] =>
  Array.isArray(value) ? value.flatMap(listOf)
    : typeof value === 'string' ? value.split(',').map((s) => s.trim()).filter(Boolean)
      : []

type Deep = { _filter?: Record<string, unknown>, [field: string]: unknown }

/**
 * Nested rows: `GET /items/spaces?fields=lists.lists_id.*` returns a public
 * space's lists — private ones too — through the spaces → spaces_lists
 * relation. For every one-to-many / many-to-many relation the requested
 * `fields` follow into content that can be private, this returns a Directus
 * `deep` that filters those nested rows the same way (merged into the
 * client's own `deep` by mergeDeep). Many-to-one links can't take a deep
 * filter; their rows are covered when the row holding them is filtered
 * (a list item only comes back if its list may be seen).
 */
export function privateRelationDeep(graph: Relations, collection: string, fields: unknown, userId: string | null): Deep {
  const out: Deep = {}
  const at = (path: string[]) => path.reduce((node, key) => (node[key] ??= {}) as Deep, out)

  const walk = (current: string, segments: string[], path: string[], depth: number) => {
    if (!segments.length || depth > 8) return
    const [raw, ...rest] = segments
    const segment = unwrapFunction(raw!.trim())
    if (!segment || !rest.length) return
    const entries = segment === '*' ? graph.byCollection.get(current) ?? [] : [segment]
    for (const entry of entries) {
      const [field, only] = entry.split(':') as [string, string | undefined]
      const targets = graph.edges.get(`${current}.${field}`)
      if (!targets) continue
      for (const target of only ? targets.filter((t) => t === only) : targets) {
        const key = only ? `${field}:${only}` : field
        if (graph.o2mAliases.has(`${current}.${field}`)) {
          const filter = privateContentFilter(target, userId)
          if (filter) {
            const node = at([...path, key])
            node._filter = node._filter ? { _and: [node._filter, filter] } : filter
          }
        }
        walk(target, rest, [...path, key], depth + 1)
      }
    }
  }

  for (const path of listOf(fields)) walk(collection, path.split('.'), [], 0)
  return out
}

/** The client's `deep` plus ours; where both filter a relation, both apply. */
export function mergeDeep(client: unknown, ours: Deep): Deep {
  const base: Deep = client && typeof client === 'object' && !Array.isArray(client) ? { ...(client as Deep) } : {}
  for (const [key, value] of Object.entries(ours)) {
    if (key === '_filter') {
      base._filter = base._filter ? { _and: [base._filter, value] } : value as Record<string, unknown>
    } else {
      base[key] = mergeDeep(base[key], value as Deep)
    }
  }
  return base
}

/**
 * The filter limiting a read of `collection` to what this viewer may see
 * (public rows, plus their own private ones), or undefined when the
 * collection has no private rows. `userId` null = signed out.
 */
export function privateContentFilter(collection: string, userId: string | null): Filter | undefined {
  const rule = own(PRIVATE_CONTENT, collection)
  if (rule) {
    const { field, values } = rule.hidden
    // _nin alone would also drop rows where the field is empty (SQL NOT IN).
    const notPrivate: Filter = { _or: [{ [field]: { _nin: values } }, { [field]: { _null: true } }] }
    return userId ? { _or: [notPrivate, rule.owner(userId)] } : notPrivate
  }
  const parents = own(PRIVATE_CHILDREN, collection)
  if (parents) {
    const filters = parents.flatMap(({ parent, field }) => {
      const parentFilter = privateContentFilter(parent, userId)
      return parentFilter ? [{ [field]: parentFilter }] : []
    })
    return filters.length > 1 ? { _and: filters } : filters[0]
  }
  return undefined
}
