import { beforeEach, describe, expect, it, vi } from 'vitest'

// Directus, orders and Pixanomy are mocked: no CMS writes or uploads in tests.
const state = vi.hoisted(() => ({
  user: { id: 'member-1', role: 'user' } as { id: string, role?: string } | null,
  effects: [] as any[],
  orders: [] as any[],
  mirror: [] as any[],
  created: [] as any[],
  deleted: [] as unknown[],
  uploads: [] as any[],
  parts: null as any[] | null,
}))

vi.mock('#auth/server/utils/sessions', () => ({
  requireAuth: async () => {
    if (!state.user) throw Object.assign(new Error('Unauthorized'), { statusCode: 401 })
    return state.user
  },
}))
vi.mock('h3', async (orig) => ({
  ...(await orig<typeof import('h3')>()),
  readMultipartFormData: async () => state.parts,
  getRouterParam: (event: any) => event.params.id,
  getQuery: (event: any) => event.query ?? {},
}))
vi.mock('#commerce/server/utils/orders', () => ({ ordersFor: async () => state.orders }))
vi.mock('#commerce/server/utils/purchasedProducts', () => ({
  PAID: new Set(['paid', 'completed']),
  purchasedRefs: (orders: any[]) => orders.flatMap((o) => o.line_items_snapshot.map((l: any) => l.product_id)),
}))
vi.mock('#shared/server/utils/pixanomy', () => ({
  detectAssetType: (data: Uint8Array) => (data[0] === 0x89 ? 'image/png' : data[0] === 0xff ? 'image/jpeg' : null),
  uploadToPixanomy: async (input: any) => { state.uploads.push(input); return { url: 'https://app.pixanomy.com/index.php/s/abc/download' } },
}))
vi.mock('@directus/sdk', () => {
  const client: any = { with: () => client, request: async (op: any) => op() }
  return {
    createDirectus: () => client,
    rest: () => ({}),
    staticToken: () => ({}),
    readItems: (collection: string, query: any) => async () => {
      if (collection === 'products') return state.mirror.filter((p) => query.filter.mageos_sku._in.includes(p.mageos_sku))
      const f = JSON.stringify(query.filter)
      const idMatch = /"id":\{"_eq":"?(\d+)"?\}/.exec(f)
      if (idMatch) return state.effects.filter((e) => String(e.id) === idMatch[1])
      if (f.includes('"creator_id"')) return state.effects.filter((e) => e.creator_id === state.user?.id)
      if (f.includes('"visibility"')) return state.effects.filter((e) => e.visibility === 'community' && !e.product && e.status === 'published')
      return state.effects.filter((e) => e.product && e.product.status === 'published' && e.status === 'published')
    },
    createItem: (_c: string, row: any) => async () => {
      const id = 100 + state.created.length
      state.created.push(row)
      state.effects.push({ id, product: null, ...row })
      return { id }
    },
    deleteItem: (_c: string, id: number) => async () => { state.deleted.push(id) },
  }
})

const utils = await import('../../server/utils/vibeEffects')
const { default: list } = await import('../../server/api/social/vibez/effects.get')
const { default: create } = await import('../../server/api/social/vibez/effects.post')
const { default: remove } = await import('../../server/api/social/vibez/effects/[id].delete')
const { canvasFilter, normalizeFilter } = await import('../../app/utils/vibeEditor/filters')
const { hasEffects, outputSize } = await import('../../app/utils/vibeEditor/exporter')
const { coverRect, stickerVisible } = await import('../../app/utils/vibeEditor/renderer')

const call = (handler: any, extra: Record<string, unknown> = {}) => handler({ node: { req: { headers: {} } }, context: {}, ...extra })
const part = (name: string, value: string | Uint8Array, extra: Record<string, unknown> = {}) =>
  ({ name, data: Buffer.from(typeof value === 'string' ? value : value), ...extra })

beforeEach(() => {
  state.user = { id: 'member-1', role: 'user' }
  state.effects = [
    { id: 1, status: 'published', kind: 'sticker', name: 'Mine', asset_url: 'https://app.pixanomy.com/s/1/download', creator_id: 'member-1', visibility: 'private', product: null },
    { id: 2, status: 'published', kind: 'sticker', name: 'Shared', asset_url: 'https://app.pixanomy.com/s/2/download', creator_id: 'other', visibility: 'community', product: null },
    { id: 3, status: 'published', kind: 'sticker', name: 'Private other', asset_url: 'https://app.pixanomy.com/s/3/download', creator_id: 'other', visibility: 'private', product: null },
    { id: 4, status: 'published', kind: 'sticker', name: 'Paid', asset_url: 'https://app.pixanomy.com/s/4/download', creator_id: 'seller', visibility: 'private', product: { id: 50, price: '2.00', status: 'published' } },
    { id: 5, status: 'published', kind: 'sticker', name: 'Free product', asset_url: 'https://app.pixanomy.com/s/5/download', creator_id: 'seller', visibility: 'private', product: { id: 51, price: '0', status: 'published' } },
    { id: 6, status: 'published', kind: 'sticker', name: 'Bought by sku', asset_url: 'https://app.pixanomy.com/s/6/download', creator_id: 'seller', visibility: 'private', product: { id: 52, price: '3', status: 'published', source: 'magento', mageos_sku: 'STK-6' } },
  ]
  state.orders = [{ payment_status: 'paid', line_items_snapshot: [{ product_id: 'magento:STK-6' }] }, { payment_status: 'pending', line_items_snapshot: [{ product_id: '50' }] }]
  state.mirror = [{ id: 52, mageos_sku: 'STK-6' }]
  state.created = []
  state.deleted = []
  state.uploads = []
})

describe('who may use an effect', () => {
  it('owners, shared ones, free products and bought products — never a paid product unpaid', async () => {
    const owned = await utils.ownedProductIds('member-1')
    expect([...owned]).toEqual(['52']) // the pending order doesn't count
    const usable = state.effects.map((e) => [e.name, utils.canUse(e, state.user, owned)])
    expect(usable).toEqual([['Mine', true], ['Shared', true], ['Private other', false], ['Paid', false], ['Free product', true], ['Bought by sku', true]])
  })

  it('never hands the Pixanomy link to the browser', () => {
    const out = utils.toClient(state.effects[0], state.user, new Set())
    expect(out.asset_url).toBe('/api/social/vibez/effects/1/asset')
    expect(JSON.stringify(out)).not.toContain('pixanomy')
  })

  it('only fetches images from Pixanomy and Directus over https', () => {
    process.env.DIRECTUS_URL = 'https://cms.meeovicms.com'
    expect(utils.assetOriginAllowed('https://app.pixanomy.com/index.php/s/x/download')).toBe(true)
    expect(utils.assetOriginAllowed('https://cms.meeovicms.com/assets/abc')).toBe(true)
    expect(utils.assetOriginAllowed('http://app.pixanomy.com/x')).toBe(false)
    expect(utils.assetOriginAllowed('https://169.254.169.254/latest')).toBe(false)
    expect(utils.assetOriginAllowed('not a url')).toBe(false)
  })
})

describe('GET /api/social/vibez/effects', () => {
  it('lists the tabs', async () => {
    const names = async (tab: string) => (await call(list, { query: { tab, kind: 'sticker' } })).items.map((i: any) => i.name)
    expect(await names('mine')).toEqual(['Mine'])
    expect(await names('community')).toEqual(['Shared'])
    expect(await names('owned')).toEqual(['Free product', 'Bought by sku'])
    const shop = (await call(list, { query: { tab: 'shop' } })).items
    expect(shop.map((i: any) => [i.name, i.usable])).toEqual([['Paid', false], ['Free product', true], ['Bought by sku', true]])
    expect(shop[2].product.key).toBe('magento:STK-6')
  })

  it('refuses unknown tabs and signed-out members', async () => {
    await expect(call(list, { query: { tab: 'all' } })).rejects.toMatchObject({ statusCode: 400 })
    state.user = null
    await expect(call(list, { query: { tab: 'mine' } })).rejects.toMatchObject({ statusCode: 401 })
  })
})

describe('POST /api/social/vibez/effects', () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3])
  it('saves a sticker to Pixanomy and the effect to Directus', async () => {
    state.parts = [part('kind', 'sticker'), part('name', 'Star'), part('visibility', 'community'), part('file', png, { filename: 'star.png', type: 'image/png' })]
    const out = await call(create)
    expect(state.uploads[0]).toMatchObject({ contentType: 'image/png', ownerId: 'member-1', category: 'vibe-effects' })
    expect(state.created[0]).toMatchObject({ kind: 'sticker', name: 'Star', visibility: 'community', creator_id: 'member-1', status: 'published' })
    expect(out.asset_url).toMatch(/^\/api\/social\/vibez\/effects\/\d+\/asset$/)
  })

  it('saves a filter from clamped settings, keeping only known ones', async () => {
    state.parts = [part('kind', 'filter'), part('name', 'Pop'), part('config', JSON.stringify({ saturate: 9, evil: 'x', hue: 20 }))]
    await call(create)
    expect(state.created[0].config).toEqual({ saturate: 2, hue: 20 })
  })

  it('refuses the wrong image types, missing files and empty filters', async () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0])
    state.parts = [part('kind', 'sticker'), part('name', 'J'), part('file', jpeg, { type: 'image/png' })]
    await expect(call(create)).rejects.toMatchObject({ statusCode: 415 })
    state.parts = [part('kind', 'background'), part('name', 'B')]
    await expect(call(create)).rejects.toMatchObject({ statusCode: 400 })
    state.parts = [part('kind', 'filter'), part('name', 'F'), part('config', '{}')]
    await expect(call(create)).rejects.toMatchObject({ statusCode: 400 })
    state.parts = [part('kind', 'video'), part('name', 'V')]
    await expect(call(create)).rejects.toMatchObject({ statusCode: 400 })
    expect(state.created).toEqual([])
  })
})

describe('DELETE /api/social/vibez/effects/:id', () => {
  it("deletes only the member's own, never a product's", async () => {
    await call(remove, { params: { id: '1' } })
    expect(state.deleted).toEqual([1])
    await expect(call(remove, { params: { id: '2' } })).rejects.toMatchObject({ statusCode: 403 })
    state.user = { id: 'seller', role: 'user' }
    await expect(call(remove, { params: { id: '4' } })).rejects.toMatchObject({ statusCode: 403 })
    expect(state.deleted).toEqual([1])
  })
})

describe('editor helpers', () => {
  it('builds canvas filters from clamped settings', () => {
    expect(canvasFilter({})).toBe('none')
    expect(canvasFilter({ brightness: 1.2, warmth: 0.3, blur: 2 }, 0.5)).toBe('brightness(1.2) sepia(0.3) blur(1px)')
    expect(normalizeFilter({ contrast: 5, vignette: -1 })).toEqual({ contrast: 1.5, vignette: 0 })
  })

  it('knows when there is nothing to bake in', () => {
    expect(hasEffects({ filter: {}, stickers: [], background: { mode: 'none' } })).toBe(false)
    expect(hasEffects({ filter: { brightness: 1, hue: 0 }, stickers: [], background: { mode: 'none' } })).toBe(false)
    expect(hasEffects({ filter: { brightness: 1.1 }, stickers: [], background: { mode: 'none' } })).toBe(true)
    expect(hasEffects({ filter: {}, stickers: [], background: { mode: 'blur', amount: 8 } })).toBe(true)
  })

  it('sizes the output at most 720p with even sides', () => {
    expect(outputSize(1920, 1080)).toEqual({ width: 1280, height: 720 })
    expect(outputSize(1080, 1920)).toEqual({ width: 406, height: 720 })
    expect(outputSize(641, 361)).toEqual({ width: 642, height: 362 })
  })

  it('places stickers in time and covers frames', () => {
    const sticker = { id: 'a', src: '', x: 0.5, y: 0.5, scale: 0.2, rotation: 0, start: 2, end: 5 }
    expect([1.9, 2, 4.9, 5].map((t) => stickerVisible(sticker, t))).toEqual([false, true, true, false])
    expect(coverRect(100, 50, 100, 100)).toEqual({ x: -50, y: 0, w: 200, h: 100 })
  })
})
