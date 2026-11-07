import { beforeEach, describe, expect, it, vi } from 'vitest'

// Directus and the session are mocked: no CMS writes in tests.
const state = vi.hoisted(() => ({
  user: { id: 'creator-1', role: 'user' } as { id: string, role?: string } | null,
  body: null as unknown,
  shorts: [] as any[],
  products: [] as any[],
  links: [] as any[],
  created: [] as any[],
  deleted: [] as unknown[],
}))

vi.mock('#auth/server/utils/sessions', () => ({
  requireAuth: async () => {
    if (!state.user) throw Object.assign(new Error('Unauthorized'), { statusCode: 401 })
    return state.user
  },
  getAuthSession: async () => (state.user ? { user: state.user } : null),
}))
vi.mock('h3', async (orig) => ({
  ...(await orig<typeof import('h3')>()),
  readBody: async () => state.body,
  getRouterParam: (event: any) => event.params.id,
}))

const matches = (row: any, filter: any): boolean => {
  if (!filter) return true
  if (filter._and) return filter._and.every((f: any) => matches(row, f))
  if (filter._or) return filter._or.some((f: any) => matches(row, f))
  return Object.entries(filter).every(([key, cond]: [string, any]) => {
    const value = row[key]
    if (cond && typeof cond === 'object' && !('_eq' in cond) && !('_in' in cond)) return value && matches(value, cond)
    if ('_eq' in cond) return String(value) === String(cond._eq)
    return cond._in.map(String).includes(String(value))
  })
}
vi.mock('@directus/sdk', () => {
  const client: any = { with: () => client, request: async (op: any) => op() }
  const table = (name: string) => ({ shorts: state.shorts, products: state.products, shorts_products: state.links } as Record<string, any[]>)[name]!
  return {
    createDirectus: () => client,
    rest: () => ({}),
    staticToken: () => ({}),
    readItems: (collection: string, query: any) => async () => table(collection).filter((row) => matches(row, query.filter)),
    createItems: (_c: string, rows: any[]) => async () => {
      for (const row of rows) {
        const product = state.products.find((p) => p.id === row.products_id)
        state.links.push({ id: 100 + state.links.length, ...row, products_id: product })
        state.created.push(row)
      }
      return rows
    },
    deleteItems: (_c: string, ids: number[]) => async () => {
      state.deleted.push(...ids)
      state.links = state.links.filter((row) => !ids.includes(row.id))
    },
  }
})

const { default: getHandler } = await import('../../server/api/social/vibez/[id]/products.get')
const { default: putHandler } = await import('../../server/api/social/vibez/[id]/products.put')
const { activePins, formatSeconds, parseSeconds } = await import('../../app/composables/vibez/useVibeProducts')

const get = (id: string) => (getHandler as any)({ params: { id }, node: { req: { headers: {} } }, context: {} })
const put = (id: string, body: unknown) => { state.body = body; return (putHandler as any)({ params: { id }, node: { req: { headers: {} } }, context: {} }) }

beforeEach(() => {
  state.user = { id: 'creator-1', role: 'user' }
  state.shorts = [{ id: 5, creator_id: 'creator-1', status: 'published' }, { id: 6, creator_id: 'someone', status: 'draft' }]
  state.products = [
    { id: 7, name: 'Lamp', status: 'published' },
    { id: 8, name: 'Loop 4', status: 'published', mageos_sku: 'LOOP-4' },
    { id: 9, name: 'Old', status: 'archived' },
  ]
  state.links = [{ id: 1, shorts_id: 5, products_id: state.products[0], start_seconds: null, end_seconds: null }]
  state.created = []
  state.deleted = []
})

describe('GET /api/social/vibez/:id/products', () => {
  it("lists a published vibe's products and says whether the member can edit", async () => {
    const res = await get('5')
    expect(res.canEdit).toBe(true)
    expect(res.items.map((i: any) => i.product.name)).toEqual(['Lamp'])
    state.user = null
    expect((await get('5')).canEdit).toBe(false)
  })

  it("hides an unpublished vibe from everyone but its creator and admins", async () => {
    state.user = null
    await expect(get('6')).rejects.toMatchObject({ statusCode: 404 })
    state.user = { id: 'admin-1', role: 'user,admin' }
    expect((await get('6')).canEdit).toBe(true)
  })
})

describe('PUT /api/social/vibez/:id/products', () => {
  it('replaces the tags, resolving store products through their mirror and sorting timed ones first', async () => {
    const res = await put('5', { tags: [{ product: 7 }, { product: 'magento:LOOP-4', start: 12, end: 20 }] })
    expect(state.created).toEqual([
      { shorts_id: 5, products_id: 7, start_seconds: null, end_seconds: null, tagged_by: 'creator-1' },
      { shorts_id: 5, products_id: 8, start_seconds: 12, end_seconds: 20, tagged_by: 'creator-1' },
    ])
    expect(state.deleted).toEqual([1])
    expect(res.items.map((i: any) => [i.product.name, i.start])).toEqual([['Loop 4', 12], ['Lamp', null]])
  })

  it("only lets the vibe's creator (or an admin) tag", async () => {
    state.user = { id: 'stranger', role: 'user' }
    await expect(put('5', { tags: [] })).rejects.toMatchObject({ statusCode: 403 })
    state.user = null
    await expect(put('5', { tags: [] })).rejects.toMatchObject({ statusCode: 401 })
    expect(state.deleted).toEqual([])
  })

  it('refuses products not for sale, bad times and too many tags, changing nothing', async () => {
    await expect(put('5', { tags: [{ product: 9 }] })).rejects.toMatchObject({ statusCode: 400 })
    await expect(put('5', { tags: [{ product: 'magento:NOPE' }] })).rejects.toMatchObject({ statusCode: 400 })
    await expect(put('5', { tags: [{ product: 7, start: 20, end: 10 }] })).rejects.toMatchObject({ statusCode: 400 })
    await expect(put('5', { tags: [{ product: 7, start: -1 }] })).rejects.toMatchObject({ statusCode: 400 })
    await expect(put('5', { tags: Array.from({ length: 21 }, () => ({ product: 7 })) })).rejects.toMatchObject({ statusCode: 400 })
    expect(state.created).toEqual([])
    expect(state.deleted).toEqual([])
  })

  it('drops an end time without a start, and repeats of the same product', async () => {
    await put('5', { tags: [{ product: 7, end: 30 }, { product: 7, start: 3 }] })
    expect(state.created).toEqual([{ shorts_id: 5, products_id: 7, start_seconds: null, end_seconds: null, tagged_by: 'creator-1' }])
  })
})

describe('timing helpers', () => {
  const items = [
    { id: 1, start: 10, end: 15, product: {} },
    { id: 2, start: 12, end: null, product: {} },
    { id: 3, start: null, end: null, product: {} },
  ]
  it('shows a card from its start until its end, or for 6 seconds', () => {
    expect(activePins(items, 9).map((i) => i.id)).toEqual([])
    expect(activePins(items, 13).map((i) => i.id)).toEqual([1, 2])
    expect(activePins(items, 17.9).map((i) => i.id)).toEqual([2])
    expect(activePins(items, 18).map((i) => i.id)).toEqual([])
  })
  it('reads and writes m:ss', () => {
    expect(formatSeconds(75)).toBe('1:15')
    expect(formatSeconds(null)).toBe('')
    expect(parseSeconds('1:15')).toBe(75)
    expect(parseSeconds('90')).toBe(90)
    expect(parseSeconds('1:02:03')).toBe(3723)
    expect(parseSeconds('')).toBeNull()
    expect(parseSeconds('abc')).toBeNaN()
  })
})
