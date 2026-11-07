import { beforeEach, describe, expect, it, vi } from 'vitest'

// Seller products that are vibe effects (layers/business
// server/api/business/products.post.ts): the store, Directus, Pixanomy and the
// seller's account are mocked — nothing is created anywhere.
const state = vi.hoisted(() => ({
  parts: [] as any[],
  storeCalls: [] as string[],
  directusCreated: [] as Array<{ collection: string, data: any }>,
  uploads: [] as any[],
}))

vi.mock('#auth/server/utils/sessions', () => ({ requireSeller: async () => ({ id: 'seller-1', username: 'shop' }) }))
vi.mock('#auth/server/utils/drizzle', () => ({ db: { select: () => ({ from: () => ({ where: () => ({ limit: async () => [{ customerId: 77 }] }) }) }) } }))
vi.mock('#auth/server/database/migrations/schema', () => ({ users: { id: 'id', magentoCustomerId: 'magento_customer_id' } }))
vi.mock('drizzle-orm', () => ({ eq: () => ({}) }))
vi.mock('#shared/server/utils/mediaSniff', () => ({ sniffMedia: () => null }))
vi.mock('#shared/server/utils/pixanomy', () => ({
  detectAssetType: (data: Uint8Array) => (data[0] === 0x89 ? 'image/png' : data[0] === 0xff ? 'image/jpeg' : null),
  uploadToPixanomy: async (input: any) => { state.uploads.push(input); return { url: 'https://app.pixanomy.com/index.php/s/fx/download' } },
}))
vi.mock('@mframework/mageos-commerce-sdk', () => ({
  commerce: {
    syncProduct: (input: any) => async () => { state.storeCalls.push(`product:${input.qty}`); return { product_id: 900, sku: input.sku } },
    syncImage: () => async () => { state.storeCalls.push('image') },
    syncDownload: () => async () => { state.storeCalls.push('download') },
  },
}))
vi.mock('@directus/sdk', () => {
  const client: any = { with: () => client, request: async (op: any) => op() }
  return {
    createDirectus: () => client,
    rest: () => ({}),
    staticToken: () => ({}),
    uploadFiles: () => async () => ({ id: 'f1' }),
    readItem: () => async () => ({ name: 'Pixanomy', type: 'department', active: 'active', categories: [{ categories_id: { id: 5, name: 'Stickers', uid: null } }] }),
    readItems: (collection: string) => async () => (collection === 'product_types' ? [{ id: 29 }] : []),
    createItems: () => async () => [],
    createItem: (collection: string, data: any) => async () => {
      state.directusCreated.push({ collection, data })
      return { id: collection === 'products' ? 4242 : 1 }
    },
  }
})
vi.stubGlobal('useRuntimeConfig', () => ({ public: { directus: { url: 'https://cms.example.com' } }, directus: { token: 't' } }))
vi.mock('h3', async (orig) => ({ ...(await orig<typeof import('h3')>()), readMultipartFormData: async () => state.parts }))

const { default: handler } = await import('../../../business/server/api/business/products.post')
const call = () => (handler as any)({ node: { req: { headers: {} } }, context: {} })
const text = (name: string, value: string) => ({ name, data: Buffer.from(value) })
const fileOf = (name: string, bytes: number[], filename = 'x.png') => ({ name, filename, type: 'image/png', data: Buffer.from(bytes) })
const base = () => [text('name', 'Gold star'), text('price', '1.50'), text('departmentId', '3'), text('categoryId', '5'), text('tags', '[]')]

beforeEach(() => {
  state.storeCalls = []
  state.directusCreated = []
  state.uploads = []
})

describe('seller vibe effect products', () => {
  it('creates the store product, types it as a Sticker and links the effect to its Directus row', async () => {
    state.parts = [...base(), text('effectKind', 'sticker'), fileOf('effect', [0x89, 0x50, 0x4e, 0x47, 1])]
    const result = await call()
    expect(result.problems).toEqual([])
    expect(state.storeCalls).toEqual(['product:100000']) // used in the editor, never out of stock
    const product = state.directusCreated.find((c) => c.collection === 'products')!.data
    expect(product.product_types).toEqual([{ product_types_id: 29 }])
    expect(product.status).toBe('draft') // waits for the store's approval
    expect(state.uploads[0]).toMatchObject({ contentType: 'image/png', ownerId: 'seller-1', category: 'vibe-effects' })
    expect(state.directusCreated.find((c) => c.collection === 'vibe_effects')!.data).toEqual({
      status: 'published', kind: 'sticker', name: 'Gold star', asset_url: 'https://app.pixanomy.com/index.php/s/fx/download',
      config: null, creator_id: 'seller-1', visibility: 'private', product: 4242,
    })
  })

  it('saves a filter from its clamped settings, with no image', async () => {
    state.parts = [...base(), text('effectKind', 'filter'), text('effectConfig', JSON.stringify({ saturate: 5, hue: 30, bogus: 1 }))]
    await call()
    expect(state.uploads).toEqual([])
    expect(state.directusCreated.find((c) => c.collection === 'vibe_effects')!.data).toMatchObject({ kind: 'filter', config: { saturate: 2, hue: 30 }, asset_url: null })
  })

  it('refuses a bad effect before anything is created in the store', async () => {
    for (const parts of [
      [...base(), text('effectKind', 'sticker')],
      [...base(), text('effectKind', 'sticker'), fileOf('effect', [0xff, 0xd8, 0xff, 0])],
      [...base(), text('effectKind', 'background'), fileOf('effect', [1, 2, 3])],
      [...base(), text('effectKind', 'filter'), text('effectConfig', '{}')],
      [...base(), text('effectKind', 'lens')],
    ]) {
      state.parts = parts
      await expect(call()).rejects.toMatchObject({ statusCode: 400 })
    }
    expect(state.storeCalls).toEqual([])
    expect(state.directusCreated).toEqual([])
  })

  it('leaves ordinary products as they were', async () => {
    state.parts = [...base(), text('qty', '3')]
    await call()
    expect(state.storeCalls).toEqual(['product:3'])
    expect(state.directusCreated.map((c) => c.collection)).toEqual(['products'])
    expect(state.directusCreated[0]!.data.product_types).toBeUndefined()
  })
})
