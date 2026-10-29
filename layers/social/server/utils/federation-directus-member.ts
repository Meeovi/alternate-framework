// A member's session on the "directus" network (this site's own members,
// notes and lists): their lists, through the same contract as their Bluesky
// session (server/utils/federation-members.ts). Lists hold things on this
// site — products (Directus or a commerce backend), vibez, spaces and notes
// — in the junction tables listItemKinds.ts maps; every read and write is
// scoped to lists the member owns (lists.user → lists_directus_users).
import { randomBytes } from 'node:crypto'
import type {
  FederatedActor,
  FederatedList,
  FederatedListInput,
  FederatedListItem,
  FederatedListItemInput,
  FederationMemberSession,
} from '../../shared/types/federation'
import { DIRECTUS_NETWORK } from './federation-directus'
import { savedItemTarget, type SavedItemTarget } from './listItemKinds'

type Row = Record<string, any>
type Query = Record<string, unknown>

export type DirectusMemberDeps = {
  /** Directus base URL, for asset links. */
  service: string
  readItems: (collection: string, query: Query) => Promise<Row[]>
  createItem: (collection: string, item: Row) => Promise<Row>
  updateItem: (collection: string, id: string | number, item: Row) => Promise<Row>
  deleteItem: (collection: string, id: string | number) => Promise<void>
  /** Name, image and price of a commerce-backend product (saved with it). */
  backendProductSnapshot: (backendId: string, key: string) => Promise<Row | null>
}

const STATUSES = { public: 'Public', private: 'Private' } as const
const LIST_FIELDS = ['id', 'name', 'slug', 'description', 'status', 'type', 'date_created', 'lists_type.lists_type_id.name']

/** Each saved-item junction, as read back through the lists alias. */
const ITEM_SOURCES = [
  { kind: 'product', alias: 'products', junction: 'lists_products', column: 'products_id', fields: ['id', 'name', 'slug', 'image', 'image_url'], path: (r: Row) => `/product/${r.slug || r.id}` },
  { kind: 'vibe', alias: 'vibez', junction: 'lists_shorts', column: 'shorts_id', fields: ['id', 'name', 'thumbnail', 'thumbnail_url'], path: (r: Row) => `/connect/vibe/${r.id}` },
  { kind: 'space', alias: 'spaces', junction: 'spaces_lists', column: 'spaces_id', fields: ['id', 'name', 'slug', 'image', 'image_url'], path: (r: Row) => `/connect/space/${r.slug || r.id}` },
] as const

const slugFor = (name: string) =>
  `${name.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').slice(0, 60) || 'list'}-${randomBytes(3).toString('hex')}`

const fail = (statusCode: number, statusMessage: string) => Object.assign(new Error(statusMessage), { statusCode, statusMessage })

export function createDirectusMemberSession(deps: DirectusMemberDeps, account: FederatedActor): FederationMemberSession {
  const assets = deps.service.replace(/\/+$/, '')
  const image = (row: Row | null | undefined) => {
    const url = row?.image_url || row?.thumbnail_url
    if (typeof url === 'string' && url) return url
    const file = row?.image || row?.thumbnail
    const id = typeof file === 'object' ? file?.id : file
    return id ? `${assets}/assets/${id}` : undefined
  }
  const owner = { user: { user_id: { _eq: account.id } } }

  const toList = (row: Row, itemCount?: number): FederatedList => ({
    id: String(row.id),
    network: DIRECTUS_NETWORK,
    name: String(row.name ?? ''),
    description: row.description || undefined,
    kind: 'items',
    visibility: String(row.status).toLowerCase() === 'public' ? 'public' : 'private',
    type: row.lists_type?.[0]?.lists_type_id?.name || undefined,
    itemCount,
    path: row.slug ? `/lists/list/${encodeURIComponent(row.slug)}` : undefined,
  })

  /** The member's list, or a 404 (someone else's list looks the same as none). */
  const owned = async (id: string, fields: string[] = LIST_FIELDS): Promise<Row> => {
    if (!/^\d+$/.test(id)) throw fail(404, 'List not found')
    const [row] = await deps.readItems('lists', { fields, filter: { id: { _eq: Number(id) }, ...owner }, limit: 1 })
    if (!row) throw fail(404, 'List not found')
    return row
  }

  const listsTypeId = async (name: string | undefined): Promise<number | undefined> => {
    if (name === undefined) return undefined
    if (!/^[\w -]{1,40}$/.test(name)) throw fail(400, 'Invalid list type')
    const [row] = await deps.readItems('lists_type', { fields: ['id'], filter: { name: { _eq: name } }, limit: 1 })
    if (!row) throw fail(400, 'Unknown list type')
    return row.id
  }

  const cleanInput = (input: Partial<FederatedListInput>) => {
    const out: Row = {}
    if (input.name !== undefined) {
      const name = String(input.name).trim()
      if (!name || name.length > 255) throw fail(400, 'A list needs a name of up to 255 characters')
      out.name = name
    }
    if (input.description !== undefined) out.description = String(input.description).slice(0, 5000)
    if (input.visibility !== undefined) {
      if (!(input.visibility in STATUSES)) throw fail(400, 'Visibility must be public or private')
      out.status = STATUSES[input.visibility]
    }
    return out
  }

  /** Item ids are "<kind>:<junction row id>", so removing one needs no lookup by kind. */
  const itemsOf = (row: Row): FederatedListItem[] => {
    const items: FederatedListItem[] = []
    for (const source of ITEM_SOURCES) {
      for (const link of row[source.alias] ?? []) {
        const target = link?.[source.column]
        if (!target) continue
        items.push({
          id: `${source.kind}:${link.id}`,
          kind: source.kind,
          ref: { id: target.id, title: target.name || undefined, image: image(target), path: source.path(target) },
        })
      }
    }
    for (const link of row.backend_products ?? []) {
      items.push({
        id: `backend-product:${link.id}`,
        kind: 'product',
        ref: { id: link.product_key, title: link.name || undefined, image: link.image || undefined, path: `/product/${encodeURIComponent(link.product_key)}` },
        addedAt: link.date_created || undefined,
      })
    }
    for (const link of row.list_items ?? []) {
      const post = link?.post_id
      if (!post) continue
      items.push({
        id: `note:${link.id}`,
        kind: 'note',
        ref: { id: post.id, title: post.title || undefined, image: image(post), path: `/connect/note/${encodeURIComponent(post.slug || post.id)}` },
        addedAt: link.date_created || undefined,
      })
    }
    return items
  }

  const ITEM_FIELDS = [
    ...ITEM_SOURCES.flatMap((s) => [`${s.alias}.id`, ...s.fields.map((f) => `${s.alias}.${s.column}.${f}`)]),
    'backend_products.id', 'backend_products.product_key', 'backend_products.name', 'backend_products.image', 'backend_products.date_created',
    'list_items.id', 'list_items.date_created', 'list_items.post_id.id', 'list_items.post_id.slug', 'list_items.post_id.title', 'list_items.post_id.image', 'list_items.post_id.image_url',
  ]

  return {
    network: DIRECTUS_NETWORK,
    account,

    async lists() {
      const rows = await deps.readItems('lists', { fields: LIST_FIELDS, filter: owner, sort: ['-date_created'], limit: -1 })
      return rows.map((row) => toList(row))
    },

    async list(id) {
      let row: Row
      try {
        row = await owned(id, [...LIST_FIELDS, ...ITEM_FIELDS])
      } catch (error: any) {
        if (error?.statusCode === 404) return null
        throw error
      }
      const items = itemsOf(row)
      return { list: toList(row, items.length), items }
    },

    async createList(input) {
      const fields = cleanInput(input)
      if (!fields.name) throw fail(400, 'A list needs a name')
      const typeId = await listsTypeId(input.type)
      const created = await deps.createItem('lists', {
        ...fields,
        slug: slugFor(fields.name),
        type: 'basic',
        status: fields.status ?? STATUSES.private,
        // lists.user is an M2M alias (lists_directus_users): the owner is
        // always the signed-in member, never something the client sends.
        user: { create: [{ user_id: account.id }], update: [], delete: [] },
        ...(typeId !== undefined ? { lists_type: { create: [{ lists_type_id: typeId }], update: [], delete: [] } } : {}),
      })
      return toList({ ...created, ...fields, lists_type: input.type ? [{ lists_type_id: { name: input.type } }] : [] }, 0)
    },

    async updateList(id, input) {
      await owned(id, ['id'])
      const fields = cleanInput(input)
      if (Object.keys(fields).length) await deps.updateItem('lists', Number(id), fields)
      return toList(await owned(id))
    },

    async deleteList(id) {
      await owned(id, ['id'])
      await deps.deleteItem('lists', Number(id))
    },

    async addToList(listId, item: FederatedListItemInput) {
      await owned(listId, ['id'])
      const lists_id = Number(listId)

      if (item.kind === 'note' && 'post' in item) {
        const [post] = await deps.readItems('posts', { fields: ['id', 'slug', 'title', 'image', 'image_url'], filter: { id: { _eq: Number(item.post) } }, limit: 1 })
        if (!post) throw fail(404, 'Note not found')
        const [existing] = await deps.readItems('list_items', { fields: ['id'], filter: { list_id: { _eq: lists_id }, post_id: { _eq: post.id } }, limit: 1 })
        const link = existing ?? await deps.createItem('list_items', { list_id: lists_id, post_id: post.id, title: post.title || null })
        return { id: `note:${link.id}`, kind: 'note', ref: { id: post.id, title: post.title || undefined, image: image(post), path: `/connect/note/${encodeURIComponent(post.slug || post.id)}` } }
      }
      if (item.kind === 'account') throw fail(400, 'Lists on Meeovi hold products, vibez, spaces and notes')

      let target: SavedItemTarget | null
      try {
        target = savedItemTarget(item.kind, 'id' in item ? item.id : undefined)
      } catch {
        target = null
      }
      if (!target) throw fail(400, 'This item can\'t be saved to a list')
      const [existing] = await deps.readItems(target.junctionCollection, {
        fields: ['id'], filter: { lists_id: { _eq: lists_id }, [target.itemIdColumn]: { _eq: target.itemId } }, limit: 1,
      })
      let link = existing
      if (!link) {
        const snapshot = target.backend ? await deps.backendProductSnapshot(target.backend.id, target.backend.key) : null
        if (target.backend && !snapshot) throw fail(404, 'Product not found')
        link = await deps.createItem(target.junctionCollection, { lists_id, [target.itemIdColumn]: target.itemId, ...(snapshot ?? {}) })
      }
      const prefix = target.backend ? 'backend-product' : item.kind
      return { id: `${prefix}:${link.id}`, kind: item.kind, ref: { id: target.itemId } }
    },

    async removeFromList(listId, itemId) {
      await owned(listId, ['id'])
      const match = /^([a-z-]+):(\d+)$/.exec(itemId)
      const junction = match && ({
        ...Object.fromEntries(ITEM_SOURCES.map((s) => [s.kind, { collection: s.junction, list: 'lists_id' }])),
        'backend-product': { collection: 'lists_backend_products', list: 'lists_id' },
        note: { collection: 'list_items', list: 'list_id' },
      } as Record<string, { collection: string, list: string }>)[match[1]!]
      if (!match || !junction) throw fail(400, 'Unknown list item')
      // Only a row that really belongs to this list.
      const [row] = await deps.readItems(junction.collection, { fields: ['id'], filter: { id: { _eq: Number(match[2]) }, [junction.list]: { _eq: Number(listId) } }, limit: 1 })
      if (!row) throw fail(404, 'Item not found in this list')
      await deps.deleteItem(junction.collection, row.id)
    },
  }
}
