import { describe, expect, it, vi } from 'vitest'
import type { ICommerceAdapter } from '../src/adapters/base.adapter'
import { mirror, type MirrorStore } from '../src/mirror/sync'
import { orderRow, storeTime } from '../src/mirror/rows'
import type { NormalizedCategory, NormalizedProduct } from '../src/types'

type Row = Record<string, any>

/** Directus collections in memory, with just enough filtering for the mirror's queries. */
function memoryStore(seed: Record<string, Row[]> = {}) {
  const tables: Record<string, Row[]> = Object.fromEntries(Object.entries(seed).map(([k, rows]) => [k, rows.map((r) => ({ ...r }))]))
  let nextId = 1000
  const matches = (row: Row, filter: Row) => Object.entries(filter).every(([field, cond]) => {
    const [op, value] = Object.entries(cond as Row)[0]!
    if (op === '_eq') return row[field] === value
    if (op === '_in') return (value as unknown[]).map(String).includes(String(row[field]))
    if (op === '_nnull') return row[field] != null
    throw new Error(`unsupported ${op}`)
  })
  const store: MirrorStore = {
    async read(collection, filter, fields, options = {}) {
      let rows = (tables[collection] ?? []).filter((r) => matches(r, filter))
      const sort = options.sort?.[0]
      if (sort) {
        const field = sort.replace(/^-/, '')
        rows = [...rows].sort((a, b) => String(a[field]).localeCompare(String(b[field])) * (sort.startsWith('-') ? -1 : 1))
      }
      if (options.limit !== undefined && options.limit >= 0) rows = rows.slice(0, options.limit)
      return rows.map((r) => Object.fromEntries(fields.map((f) => [f, r[f]])))
    },
    async create(collection, rows) {
      for (const row of rows) (tables[collection] ??= []).push({ id: row.id ?? nextId++, ...row })
    },
    async update(collection, key, row) {
      const target = tables[collection]!.find((r) => r.id === key)
      if (!target) throw new Error(`no ${collection} ${key}`)
      Object.assign(target, row)
    },
    async remove(collection, keys) {
      tables[collection] = (tables[collection] ?? []).filter((r) => !keys.includes(r.id))
    },
  }
  return { store, tables }
}

const product = (sku: string, name = sku): NormalizedProduct => ({
  id: `uid-${sku}`, sku, name, slug: sku.toLowerCase(), price: { regular: 10, final: 8, currency: 'USD' }, inStock: true,
  images: [], categories: [], attributes: { description: `<p>${name}</p>` }, updatedAt: '2026-10-20T10:00:00.000Z',
})
const category = (id: string, slug: string, children: NormalizedCategory[] = [], level = 1): NormalizedCategory => ({
  id, name: slug.toUpperCase(), slug, path: slug, level, position: 1, productCount: 0, includeInMenu: true, children,
})

function adapter(parts: Partial<ICommerceAdapter>): ICommerceAdapter {
  return { id: 'test', getInventory: async () => ({}), ...parts } as ICommerceAdapter
}

const now = () => new Date('2026-10-23T12:00:00.000Z')

describe('mirror products', () => {
  it('creates, updates by mageos_id, and archives what the store dropped', async () => {
    const { store, tables } = memoryStore({
      products: [
        { id: 1, source: null, name: 'Directus-only', status: 'published' },
        { id: 2, source: 'magento', mageos_id: 'uid-A', name: 'Old A', status: 'published', stock: 1 },
        { id: 3, source: 'magento', mageos_id: 'uid-GONE', name: 'Gone', status: 'published' },
      ],
    })
    const getProductPage = vi.fn(async ({ page }: { page?: number }) => page === 1
      ? { items: [product('A', 'New A')], page: 1, pageSize: 1, total: 2, totalPages: 2 }
      : { items: [product('B')], page: 2, pageSize: 1, total: 2, totalPages: 2 })
    const stats = await mirror('products', adapter({ getProductPage, getInventory: async () => ({ A: 7 }) }), store, { now })

    expect(stats).toEqual({ section: 'products', created: 1, updated: 1, unchanged: 0, archived: 1, links: 0 })
    const [native, a, gone, b] = tables.products!
    expect(native).toEqual({ id: 1, source: null, name: 'Directus-only', status: 'published' })
    expect(a).toMatchObject({ name: 'New A', mageos_sku: 'A', price: 8, stock: 7, content: '<p>New A</p>', mageos_synced_at: '2026-10-23T12:00:00.000Z' })
    expect(gone).toMatchObject({ status: 'archived' })
    // Unknown live stock: the field isn't written at all.
    expect(b).toMatchObject({ source: 'magento', mageos_id: 'uid-B', name: 'B' })
    expect(b).not.toHaveProperty('stock')
  })
})

describe('a second run over unchanged store data', () => {
  it('writes nothing', async () => {
    const { store } = memoryStore({ products: [], categories: [] })
    const update = vi.spyOn(store, 'update')
    const create = vi.spyOn(store, 'create')
    const shop = adapter({
      getProductPage: async () => ({ items: [product('A')], page: 1, pageSize: 1, total: 1, totalPages: 1 }),
      getInventory: async () => ({ A: 3 }),
      getCategories: async () => [category('Mzg=', 'whats-new')],
    })
    await mirror('products', shop, store, { now })
    await mirror('categories', shop, store, { now })
    create.mockClear()
    const later = () => new Date('2026-10-23T12:15:00.000Z')
    expect(await mirror('products', shop, store, { now: later })).toMatchObject({ created: 0, updated: 0, unchanged: 1 })
    expect(await mirror('categories', shop, store, { now: later })).toMatchObject({ created: 0, updated: 0, unchanged: 1 })
    expect(update).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })

  it('treats Directus\'s string decimals and ISO timestamps as equal values', async () => {
    const { store, tables } = memoryStore({ products: [{
      id: 5, source: 'magento', mageos_id: 'uid-A', mageos_sku: 'A', name: 'A', price: '8.00', status: 'published', visibility: true,
      content: '<p>A</p>', updated_at: '2026-10-20T10:00:00+00:00',
      slug: 'a', type: null, regular_price: '10.0000', currency_code: 'USD', in_stock: true, short_description: null, meta_title: null,
      meta_description: null, image_url: null, gallery: [], options: null, variants: null, mageos_attributes: null,
    }] })
    const update = vi.spyOn(store, 'update')
    const shop = adapter({ getProductPage: async () => ({ items: [product('A')], page: 1, pageSize: 1, total: 1, totalPages: 1 }) })
    expect(await mirror('products', shop, store, { now })).toMatchObject({ unchanged: 1, updated: 0 })
    expect(update).not.toHaveBeenCalled()
    expect(tables.products![0]!.price).toBe('8.00')
  })
})

describe('a full product copy', () => {
  it('has everything the product page shows, in plain fields', async () => {
    const { store, tables } = memoryStore({ products: [] })
    const full: NormalizedProduct = {
      ...product('T', 'Tee'),
      images: ['https://shop.test/media/tee.jpg', 'https://shop.test/media/tee-back.jpg'],
      attributes: {
        type: 'configurable', description: '<p>Soft.</p>', shortDescription: '<p>A tee.</p>', metaTitle: 'Tee', metaDescription: 'A soft tee',
        options: [{ code: 'size', label: 'Size', values: [{ id: 1, label: 'S' }] }],
        variants: [{ id: 'v1', sku: 'T-S', inStock: true, price: { regular: 10, final: 8, currency: 'USD' }, options: { size: 1 } }],
        material: 'Cotton', onlyLeftInStock: 2,
      },
    }
    await mirror('products', adapter({ getProductPage: async () => ({ items: [full], page: 1, pageSize: 1, total: 1, totalPages: 1 }) }), store, { now })
    expect(tables.products![0]).toMatchObject({
      slug: 't', type: 'configurable', price: 8, regular_price: 10, currency_code: 'USD', in_stock: true,
      content: '<p>Soft.</p>', short_description: '<p>A tee.</p>', meta_title: 'Tee', meta_description: 'A soft tee',
      image_url: 'https://shop.test/media/tee.jpg', gallery: full.images,
      options: full.attributes.options, variants: full.attributes.variants, mageos_attributes: { material: 'Cotton' },
    })
  })

  it('asks the backend for full product detail', async () => {
    const getProductPage = vi.fn(async () => ({ items: [], page: 1, pageSize: 50, total: 0, totalPages: 0 }))
    await mirror('products', adapter({ getProductPage }), memoryStore({ products: [] }).store, { now })
    expect(getProductPage).toHaveBeenCalledWith(expect.objectContaining({ detail: true, page: 1 }))
  })
})

describe('product categories', () => {
  const tagged = (sku: string, ...uids: string[]): NormalizedProduct => ({ ...product(sku), categories: uids.map((id) => ({ id, name: id, slug: id })) })
  const seed = () => memoryStore({
    categories: [{ id: 10, uid: 'cat-tops' }, { id: 11, uid: 'cat-sale' }, { id: 12, uid: null, name: 'Editors pick' }],
    products: [{ id: 2, source: 'magento', mageos_id: 'uid-A', name: 'A', status: 'published' }],
    products_categories: [
      { id: 90, products_id: 2, categories_id: 11 }, // the store dropped "sale"
      { id: 91, products_id: 2, categories_id: 12 }, // an editor's CMS-only category
      { id: 92, products_id: 2, categories_id: 10 }, // still right
      { id: 93, products_id: 2, categories_id: 10 }, // duplicate
    ],
  })

  it("links products to the store's categories and leaves CMS-only links alone", async () => {
    const { store, tables } = seed()
    const shop = adapter({ getProductPage: async () => ({ items: [tagged('A', 'cat-tops'), tagged('B', 'cat-sale', 'cat-unknown')], page: 1, pageSize: 2, total: 2, totalPages: 1 }) })
    const stats = await mirror('products', shop, store, { now })
    const b = tables.products!.find((r) => r.mageos_id === 'uid-B')!
    expect(tables.products_categories!.map((l) => [l.products_id, l.categories_id]).sort()).toEqual([[2, 10], [2, 12], [b.id, 11]].sort())
    expect(stats.links).toBe(3) // two removed, one added

    // A second run changes nothing.
    const remove = vi.spyOn(store, 'remove')
    expect((await mirror('products', shop, store, { now })).links).toBe(0)
    expect(remove).not.toHaveBeenCalled()
  })
})

describe('mirror categories', () => {
  it('updates by uid, links a same-slug CMS category without renaming it, creates the rest', async () => {
    const { store, tables } = memoryStore({
      categories: [
        { id: 1, uid: 'Mzg=', slug: 'whats-new', name: 'Old', mageos_owned: true },
        { id: 2, uid: null, slug: 'Books', name: 'Our books', description: 'CMS copy' },
      ],
    })
    const tree = [category('Mzg=', 'whats-new'), category('Mzk=', 'books', [category('NDA=', 'novels', [], 2)])]
    const stats = await mirror('categories', adapter({ getCategories: async () => tree }), store, { now })

    expect(stats).toEqual({ section: 'categories', created: 1, updated: 1, unchanged: 0, linked: 1 })
    // Next run: the linked CMS category still keeps its name and position.
    expect(await mirror('categories', adapter({ getCategories: async () => tree }), store, { now })).toMatchObject({ updated: 0, linked: 0 })
    expect(tables.categories![1]).toMatchObject({ name: 'Our books' })
    expect(tables.categories![1]).not.toHaveProperty('sort')
    expect(tables.categories![0]).toMatchObject({ name: 'WHATS-NEW', mageos_path: 'whats-new' })
    expect(tables.categories![1]).toEqual({
      id: 2, uid: 'Mzk=', slug: 'Books', name: 'Our books', description: 'CMS copy',
      mageos_path: 'books', mageos_parent_uid: null, mageos_level: 1, mageos_synced_at: '2026-10-23T12:00:00.000Z',
    })
    expect(tables.categories![2]).toMatchObject({ uid: 'NDA=', slug: 'novels', title: 'NOVELS', mageos_parent_uid: 'Mzk=', mageos_level: 2, mageos_owned: true })
  })
})

const storeOrder = (id: number, updated: string) => ({
  entity_id: id, increment_id: `00000000${id}`, status: 'complete', state: 'complete', customer_id: 42, customer_email: 'a@b.c',
  order_currency_code: 'USD', grand_total: 4.99, subtotal: 4.99, total_paid: 4.99, total_refunded: 0,
  created_at: '2026-10-17 05:23:15', updated_at: updated, items: [{ item_id: 1, sku: 'A', name: 'A', qty_ordered: 1, qty_invoiced: 1, price: 4.99 }],
})

describe('mirror orders', () => {
  it('continues from the newest mirrored change and pages until done', async () => {
    const { store, tables } = memoryStore({
      orders: [
        { id: 1, entity_id: 3, date_updated: '2026-10-23T09:00:00.000Z', mageos_updated_at: '2026-10-18T00:00:00.000Z', mageos_synced_at: '2026-10-18T00:00:00.000Z' },
        { id: 2, entity_id: null, buyer_id: 'app-user', date_updated: '2026-10-22T00:00:00.000Z', mageos_synced_at: null },
      ],
    })
    const orders = vi.fn(async (_since: string | null, page: number) => page === 1
      ? { items: [storeOrder(3, '2026-10-19 08:00:00'), storeOrder(4, '2026-10-19 09:00:00')], total: 3 }
      : { items: [storeOrder(5, '2026-10-20 09:00:00')], total: 3 })
    const stats = await mirror('orders', adapter({ mirror: { orders, customers: vi.fn() } }), store, { now, pageSize: 2 })

    // The app's own (non-mirrored) order doesn't move the cursor.
    expect(orders).toHaveBeenNthCalledWith(1, '2026-10-18 00:00:00', 1, 2)
    expect(stats).toEqual({ section: 'orders', created: 2, updated: 1, unchanged: 0 })
    expect(tables.orders!.map((o) => o.entity_id)).toEqual([3, null, 4, 5])
    expect(tables.orders![0]).toMatchObject({ grand_total: 499, payment_status: 'completed', mageos_updated_at: '2026-10-19T08:00:00.000Z' })
    // Directus's own auto-stamped date fields are never written by the mirror.
    expect(tables.orders![2]).not.toHaveProperty('date_created')
    expect(tables.orders![2]).not.toHaveProperty('date_updated')
    expect(tables.orders![2]).not.toHaveProperty('buyer_id')
  })

  it('stops after maxPages and says there is more', async () => {
    const { store } = memoryStore({ orders: [] })
    const orders = vi.fn(async () => ({ items: [storeOrder(9, '2026-10-19 08:00:00')], total: 10 }))
    expect(await mirror('orders', adapter({ mirror: { orders, customers: vi.fn() } }), store, { pageSize: 1, maxPages: 2 }))
      .toMatchObject({ more: true })
    expect(orders).toHaveBeenCalledTimes(2)
  })

  it('maps money to cents and lines like the app', () => {
    expect(orderRow(storeOrder(3, '2026-10-19 08:00:00'), 'now')).toMatchObject({
      entity_id: 3, grand_total: 499, total_paid: 499, line_items_snapshot: [{ product_id: 'magento:A', quantity: 1, unit_amount: 4.99 }],
    })
  })
})

describe('mirror customers', () => {
  it('links customers to app accounts and keys rows by the store id', async () => {
    const { store, tables } = memoryStore({
      customers: [{ id: 30, email: 'old@x.y', mageos_synced_at: '2026-10-01T00:00:00.000Z', updated_at: '2026-10-01T00:00:00.000Z' }],
      users: [{ id: 'user-97', magento_customer_id: '97' }],
    })
    const customers = vi.fn(async () => ({
      items: [
        { id: 30, email: 'new@x.y', firstname: 'A', lastname: 'B', group_id: 1, website_id: 1, created_at: '2026-09-01 00:00:00', updated_at: '2026-10-21 00:00:00' },
        { id: 97, email: 's@x.y', firstname: 'S', lastname: 'L', group_id: 1, website_id: 1, created_at: '2026-09-02 00:00:00', updated_at: '2026-10-22 00:00:00' },
      ],
      total: 2,
    }))
    expect(await mirror('customers', adapter({ mirror: { orders: vi.fn(), customers } }), store, { now })).toEqual({ section: 'customers', created: 1, updated: 1, unchanged: 0 })
    expect(customers).toHaveBeenCalledWith('2026-10-01 00:00:00', 1, 100)
    expect(tables.customers).toEqual([
      expect.objectContaining({ id: 30, email: 'new@x.y', user_id: null }),
      expect.objectContaining({ id: 97, user_id: 'user-97', updated_at: '2026-10-22T00:00:00.000Z' }),
    ])
  })

  it('skips a section that is already running', async () => {
    let release!: () => void
    const { store } = memoryStore({ customers: [], users: [] })
    const customers = vi.fn(() => new Promise<{ items: Row[], total: number }>((resolve) => { release = () => resolve({ items: [], total: 0 }) }))
    const first = mirror('customers', adapter({ mirror: { orders: vi.fn(), customers } }), store)
    await vi.waitFor(() => expect(customers).toHaveBeenCalled())
    expect(await mirror('customers', adapter({ mirror: { orders: vi.fn(), customers } }), store)).toMatchObject({ skipped: 'already running' })
    release()
    await first
  })
})

it('formats store times', () => {
  expect(storeTime('2026-10-19T08:00:00.000Z')).toBe('2026-10-19 08:00:00')
})

it('sends search filter values with %20, which is what OAuth 1.0a signs', async () => {
  const { searchCriteria } = await import('../src/adapters/mage-os.mappers')
  const query = searchCriteria([{ field: 'updated_at', value: '2025-08-28 03:12:05', condition: 'gteq' }], 5, 'updated_at', 2, 'ASC')
  expect(query).toContain('2025-08-28%2003%3A12%3A05')
  expect(query).not.toContain('+')
  expect(new URLSearchParams(query).get('searchCriteria[currentPage]')).toBe('2')
})
