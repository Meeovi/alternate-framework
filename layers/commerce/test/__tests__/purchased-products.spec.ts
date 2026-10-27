import { beforeEach, describe, expect, it, vi } from 'vitest'

// Directus in memory: readItems() becomes { collection, query } and the
// client answers from these rows, honouring the filters the helper sends.
let tables: Record<string, Record<string, any>[]>
const requests: Array<{ collection: string, query: any }> = []
vi.mock('@directus/sdk', () => ({
  createDirectus: () => ({
    with() { return this },
    request: async ({ collection, query }: { collection: string, query: any }) => {
      requests.push({ collection, query })
      const f = query.filter ?? {}
      return (tables[collection] ?? []).filter((row) => {
        if (f.id?._in && !f.id._in.map(String).includes(String(row.id))) return false
        if (f.status?._eq && row.status !== f.status._eq) return false
        if (f.source?._eq && row.source !== f.source._eq) return false
        if (f.payment_status?._in && !f.payment_status._in.includes(row.payment_status)) return false
        if (f._or && !f._or.some((c: any) => (c.mageos_sku && c.mageos_sku._in.includes(row.mageos_sku)) || (c.type && row.type === c.type._eq))) return false
        return true
      })
    },
  }),
  rest: () => ({}),
  staticToken: () => ({}),
  readItems: (collection: string, query: any) => ({ collection, query }),
}))

const { productsForRefs, purchasedRefs, recentPaidOrders, readLimit } = await import('../../server/utils/purchasedProducts')

beforeEach(() => {
  requests.length = 0
  tables = {
    products: [
      { id: 1, name: 'Own mug', status: 'published', source: null, image: 'file-1' },
      { id: 2, name: 'Retired', status: 'archived', source: null },
      { id: 31, name: 'Habit Tracker', status: 'published', source: 'magento', mageos_sku: 'meeovi-habit-tracker', type: 'virtual', image: null, image_url: 'https://shop.test/ht.jpg' },
      { id: 40, name: 'Tee', status: 'published', source: 'magento', mageos_sku: 'WS08', type: 'configurable', image: null, image_url: null,
        variants: [{ sku: 'WS08-XS-Blue' }, { sku: 'WS08-M-Red' }] },
    ],
  }
})

describe('purchasedRefs', () => {
  it('lists each product once, in order', () => {
    expect(purchasedRefs([
      { line_items_snapshot: [{ product_id: 'magento:A' }, { product_id: '1' }] },
      { line_items_snapshot: [{ product_id: '1' }, { product_id: null }, { product_id: 'magento:B' }] },
      { line_items_snapshot: null },
    ])).toEqual(['magento:A', '1', 'magento:B'])
  })
})

describe('productsForRefs', () => {
  it('resolves Directus ids and store SKUs (variants to their product), keeping the order and dropping repeats', async () => {
    const products = await productsForRefs(['magento:WS08-XS-Blue', '1', 'magento:WS08-M-Red', 'magento:meeovi-habit-tracker'], 12)
    expect(products.map((p) => p.id)).toEqual([40, 1, 31])
    expect(products[0]).not.toHaveProperty('variants')
  })

  it("uses a store product's image URL for the card", async () => {
    const [ht] = await productsForRefs(['magento:meeovi-habit-tracker'], 12)
    expect(ht!.image).toBe('https://shop.test/ht.jpg')
  })

  it('leaves out products no longer for sale or unknown', async () => {
    expect((await productsForRefs(['2', 'magento:GONE', '999'], 12))).toEqual([])
  })

  it('stops at the limit', async () => {
    expect((await productsForRefs(['1', 'magento:WS08', 'magento:meeovi-habit-tracker'], 2)).map((p) => p.id)).toEqual([1, 40])
  })

  it('asks only for published products', async () => {
    await productsForRefs(['1', 'magento:WS08'], 12)
    expect(requests.every((r) => r.query.filter.status._eq === 'published')).toBe(true)
  })
})

describe('recentPaidOrders', () => {
  it("asks only for paid orders, newest first by the store's own order time", async () => {
    tables.orders = [
      { payment_status: 'completed', date_created: '2026-10-26T10:00:00Z', mageos_created_at: '2026-10-20T10:00:00Z', line_items_snapshot: [{ product_id: 'old' }] },
      { payment_status: 'completed', date_created: '2026-10-25T10:00:00Z', mageos_created_at: null, line_items_snapshot: [{ product_id: 'new' }] },
      { payment_status: 'refunded', date_created: '2026-10-26T11:00:00Z', line_items_snapshot: [{ product_id: 'refunded' }] },
    ]
    expect(purchasedRefs(await recentPaidOrders())).toEqual(['new', 'old'])
    expect(requests[0]!.query.fields).not.toContain('buyer_id')
  })
})

it('readLimit keeps the limit sane', () => {
  expect([readLimit(undefined), readLimit('5'), readLimit('500'), readLimit('-1'), readLimit('x')]).toEqual([12, 5, 24, 12, 12])
})
