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

/** Rows that belong to a private-capable parent: visible when the parent is. */
const PRIVATE_CHILDREN: Record<string, { parent: string, field: string }> = {
  list_items: { parent: 'lists', field: 'list_id' },
  lists_products: { parent: 'lists', field: 'lists_id' },
  lists_backend_products: { parent: 'lists', field: 'lists_id' },
  lists_type_lists: { parent: 'lists', field: 'lists_id' },
  lists_shorts: { parent: 'lists', field: 'lists_id' },
  spaces_lists: { parent: 'lists', field: 'lists_id' },
}

/** Collections whose reads must go through privacy checks. */
export const PRIVATE_CONTENT_COLLECTIONS = new Set([...Object.keys(PRIVATE_CONTENT), ...Object.keys(PRIVATE_CHILDREN)])

function own<T>(map: Record<string, T>, key: string): T | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined
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
  const child = own(PRIVATE_CHILDREN, collection)
  if (child) {
    const parentFilter = privateContentFilter(child.parent, userId)
    return parentFilter ? { [child.field]: parentFilter } : undefined
  }
  return undefined
}
