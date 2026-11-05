import { beforeEach, describe, expect, it } from 'vitest'
import { createDirectusMemberSession, type DirectusMemberDeps } from '../../server/utils/federation-directus-member'

// A tiny in-memory Directus: enough filtering for the queries the session makes.
type Row = Record<string, any>
let tables: Record<string, Row[]>
let nextId: number

const matches = (row: Row, filter: Record<string, any> = {}): boolean => Object.entries(filter).every(([key, cond]) => {
  if (key === 'user') return (tables.lists_directus_users ?? []).some((j) => j.list_id === row.id && j.user_id === cond.user_id._eq)
  if (key === 'name' && cond._eq !== undefined) return row.name === cond._eq
  return row[key] === cond._eq
})

const expand = (list: Row): Row => ({
  ...list,
  lists_type: (tables.lists_type_lists ?? []).filter((j) => j.lists_id === list.id).map((j) => ({ lists_type_id: tables.lists_type!.find((t) => t.id === j.lists_type_id) })),
  products: (tables.lists_products ?? []).filter((j) => j.lists_id === list.id).map((j) => ({ id: j.id, products_id: tables.products!.find((p) => p.id === j.products_id) })),
  vibez: [], spaces: [],
  backend_products: (tables.lists_backend_products ?? []).filter((j) => j.lists_id === list.id),
  list_items: (tables.list_items ?? []).filter((j) => j.list_id === list.id).map((j) => ({ ...j, post_id: tables.posts!.find((p) => p.id === j.post_id) })),
})

const deps: DirectusMemberDeps = {
  service: 'https://cms.test',
  async readItems(collection, query: any) {
    const rows = (tables[collection] ?? []).filter((row) => matches(row, query.filter))
    return collection === 'lists' ? rows.map(expand) : rows
  },
  async createItem(collection, item) {
    const { user, lists_type, ...rest } = item
    const row = { id: nextId++, ...rest }
    ;(tables[collection] ??= []).push(row)
    for (const j of user?.create ?? []) (tables.lists_directus_users ??= []).push({ list_id: row.id, user_id: j.user_id })
    for (const j of lists_type?.create ?? []) (tables.lists_type_lists ??= []).push({ lists_id: row.id, lists_type_id: j.lists_type_id })
    return row
  },
  async updateItem(collection, id, item) {
    const row = tables[collection]!.find((r) => r.id === id)!
    Object.assign(row, item)
    return row
  },
  async deleteItem(collection, id) {
    tables[collection] = tables[collection]!.filter((r) => r.id !== id)
  },
  async backendProductSnapshot(_backend, key) {
    return key === 'photo-1' ? { name: 'Photo 1', image: 'https://img.test/1.jpg', price: 0 } : null
  },
}

const me = createDirectusMemberSession(deps, { id: 'u-me', network: 'directus', handle: 'me' })
const other = createDirectusMemberSession(deps, { id: 'u-other', network: 'directus', handle: 'other' })

beforeEach(() => {
  nextId = 100
  tables = {
    lists: [{ id: 1, name: 'Theirs', slug: 'theirs', status: 'Private' }],
    lists_directus_users: [{ list_id: 1, user_id: 'u-other' }],
    lists_type: [{ id: 2, name: 'Wishlist' }],
    products: [{ id: 7, name: 'Lamp', slug: 'lamp', image: 'file-7' }],
    posts: [{ id: 9, title: 'Hello', slug: 'hello' }],
  }
})

describe('Meeovi lists through the federation', () => {
  it('creates a private list owned by the member, with its type', async () => {
    const list = await me.createList!({ name: '  Gifts ', type: 'Wishlist' })
    expect(list).toMatchObject({ network: 'directus', name: 'Gifts', kind: 'items', visibility: 'private', type: 'Wishlist', itemCount: 0 })
    expect(list.path).toMatch(/^\/lists\/list\/gifts-[0-9a-f]{6}$/)
    expect((await me.lists!()).map((l) => l.name)).toEqual(['Gifts'])
  })

  it('never shows, changes or deletes someone else\'s list', async () => {
    expect(await me.lists!()).toEqual([])
    expect(await me.list!('1')).toBeNull()
    await expect(me.updateList!('1', { name: 'Mine now' })).rejects.toMatchObject({ statusCode: 404 })
    await expect(me.deleteList!('1')).rejects.toMatchObject({ statusCode: 404 })
    await expect(me.addToList!('1', { kind: 'product', id: 7 })).rejects.toMatchObject({ statusCode: 404 })
    expect(tables.lists![0]!.name).toBe('Theirs')
    expect((await other.lists!()).map((l) => l.name)).toEqual(['Theirs'])
  })

  it('renames, makes public and deletes the member\'s own list', async () => {
    const { id } = await me.createList!({ name: 'Trips' })
    expect(await me.updateList!(id, { name: 'Travel', visibility: 'public' })).toMatchObject({ name: 'Travel', visibility: 'public' })
    await me.deleteList!(id)
    expect(await me.lists!()).toEqual([])
  })

  it('saves products, store products and notes, once each, and removes them', async () => {
    const { id } = await me.createList!({ name: 'Saved' })
    const product = await me.addToList!(id, { kind: 'product', id: 7 })
    const again = await me.addToList!(id, { kind: 'product', id: '7' })
    expect(again.id).toBe(product.id)
    await me.addToList!(id, { kind: 'product', id: 'magento:photo-1' })
    await me.addToList!(id, { kind: 'note', post: '9' })

    const found = await me.list!(id)
    expect(found!.list.itemCount).toBe(3)
    expect(found!.items.map((i) => [i.kind, i.ref?.title, i.ref?.path])).toEqual([
      ['product', 'Lamp', '/product/lamp'],
      ['product', 'Photo 1', '/product/magento%3Aphoto-1'],
      ['note', 'Hello', '/connect/note/hello'],
    ])
    expect(found!.items[0]!.ref?.image).toBe('https://cms.test/assets/file-7')

    await me.removeFromList!(id, product.id)
    expect((await me.list!(id))!.items).toHaveLength(2)
  })

  it('refuses things a Meeovi list can\'t hold, and items of other lists', async () => {
    const { id } = await me.createList!({ name: 'Mixed' })
    await expect(me.addToList!(id, { kind: 'account', actor: 'alice.bsky.social' })).rejects.toMatchObject({ statusCode: 400 })
    await expect(me.addToList!(id, { kind: 'product', id: 'magento:missing' })).rejects.toMatchObject({ statusCode: 404 })
    await expect(me.addToList!(id, { kind: 'planet', id: 1 })).rejects.toMatchObject({ statusCode: 400 })
    tables.lists_products = [{ id: 55, lists_id: 1, products_id: 7 }]
    await expect(me.removeFromList!(id, 'product:55')).rejects.toMatchObject({ statusCode: 404 })
    await expect(me.removeFromList!(id, 'nonsense')).rejects.toMatchObject({ statusCode: 400 })
  })
})
