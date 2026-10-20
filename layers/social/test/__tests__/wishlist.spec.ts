import { beforeEach, describe, expect, it, vi } from 'vitest'

// A fake Directus: requests are { op, collection, query/data } descriptors.
const requests: any[] = []
let respond: (req: any) => any = () => []
vi.mock('@directus/sdk', () => {
  const client = { with: () => client, request: async (req: any) => { requests.push(req); return respond(req) } }
  return {
    createDirectus: () => client,
    rest: () => ({}),
    staticToken: () => ({}),
    readItems: (collection: string, query: any) => ({ op: 'read', collection, query }),
    createItem: (collection: string, data: any, query?: any) => ({ op: 'create', collection, data, query }),
    deleteItems: (collection: string, ids: any[]) => ({ op: 'delete', collection, ids }),
  }
})
vi.mock('../../server/utils/backendProducts', () => ({
  backendProductSnapshot: vi.fn(async (_backend: string, key: string) => (key === 'gone' ? null : { backend_id: 'MQ==', name: 'Kanban', price: 4.99 })),
}))

const { addToList, ensureWishlist, findWishlist, removeFromList, wishlistKeys } = await import('../../server/utils/wishlist')

beforeEach(() => {
  requests.length = 0
  respond = () => []
})

describe('wishlist (a list of type "Wishlist")', () => {
  it('finds the user\'s oldest Wishlist-type list', async () => {
    respond = () => [{ id: 3, slug: 'wishlist-x', name: 'Wishlist' }]
    expect(await findWishlist('u1')).toEqual({ id: 3, slug: 'wishlist-x', name: 'Wishlist' })
    expect(requests[0].query).toMatchObject({
      filter: { _and: [{ user: { user_id: { _eq: 'u1' } } }, { lists_type: { lists_type_id: { name: { _eq: 'Wishlist' } } } }] },
      sort: ['id'],
      limit: 1,
    })
  })

  it('creates a private Wishlist list on first use, once even for two quick hearts', async () => {
    respond = (req) => {
      if (req.op === 'read' && req.collection === 'lists') return []
      if (req.op === 'read' && req.collection === 'lists_type') return [{ id: 2 }]
      if (req.op === 'create') return { id: 30, slug: req.data.slug, name: req.data.name }
      return []
    }
    const [a, b] = await Promise.all([ensureWishlist('u1'), ensureWishlist('u1')])
    expect(a).toEqual(b)
    const creates = requests.filter((r) => r.op === 'create')
    expect(creates).toHaveLength(1)
    expect(creates[0].data).toMatchObject({
      name: 'Wishlist',
      status: 'Private',
      user: { create: [{ user_id: 'u1' }] },
      lists_type: { create: [{ lists_type_id: 2 }] },
    })
    expect(creates[0].data.slug).toMatch(/^wishlist-[0-9a-f]{8}$/)
  })

  it('reads saved keys from both product junctions', async () => {
    respond = () => [{ products: [{ products_id: 42 }], backend_products: [{ product_key: 'magento:kanban' }] }]
    expect(await wishlistKeys(3)).toEqual(['42', 'magento:kanban'])
  })

  it('saves Directus and backend products where "Add to List" does, with a snapshot for the latter', async () => {
    await addToList(3, '42')
    expect(requests.at(-1)).toMatchObject({ op: 'create', collection: 'lists_products', data: { lists_id: 3, products_id: 42 } })
    await addToList(3, 'magento:kanban')
    expect(requests.at(-1)).toMatchObject({
      op: 'create', collection: 'lists_backend_products', data: { lists_id: 3, product_key: 'magento:kanban', name: 'Kanban' },
    })
  })

  it('does not save twice, refuses unknown products, and removes', async () => {
    respond = () => [{ id: 7 }]
    await addToList(3, '42')
    expect(requests.some((r) => r.op === 'create')).toBe(false)
    respond = () => []
    await expect(addToList(3, 'magento:gone')).rejects.toMatchObject({ statusCode: 404 })
    await expect(addToList(3, 'not a product')).rejects.toMatchObject({ statusCode: 400 })
    respond = () => [{ id: 7 }]
    await removeFromList(3, '42')
    expect(requests.at(-1)).toEqual({ op: 'delete', collection: 'lists_products', ids: [7] })
  })
})
