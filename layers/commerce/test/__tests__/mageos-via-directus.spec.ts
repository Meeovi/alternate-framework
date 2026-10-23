import { describe, expect, it, vi } from 'vitest'
import {
  createMageosDirectusBackend,
  createMageosDirectusCustomerLink,
  createMageosDirectusIntegrationStore,
  toStorefrontProduct,
} from '../../shared/mageosViaDirectus'

type Call = { path: string, method: string, params?: Record<string, string>, body?: string }

/** A Directus client whose request() answers by "METHOD path", like the SDK (data only, or throws its { errors, response }). */
function fakeDirectus(routes: Record<string, (call: Call) => unknown>) {
  const calls: Call[] = []
  const client = {
    request: vi.fn(async (command: () => Call) => {
      const call = command()
      calls.push(call)
      const handler = routes[`${call.method} ${call.path}`]
      if (!handler) throw { errors: [{ message: 'Not found', extensions: { code: 'NOT_FOUND' } }], response: { status: 404 } }
      return handler(call)
    }),
  }
  return { client: client as never, calls }
}

const sdkError = (status: number, message: string, code = 'REJECTED') => {
  throw { errors: [{ message, extensions: { code } }], response: { status } }
}

const product = {
  id: 'MjExNg==', sku: 'HABIT', name: 'Habit Tracker', slug: 'habit',
  price: { regular: 5, final: 4.99, currency: 'USD' }, inStock: true,
  images: ['https://shop/a.jpg', 'https://shop/b.jpg'], categories: [],
  attributes: { type: 'virtual', description: '<p>Daily <b>habits</b></p>', shortDescription: 'Habits &amp; streaks' },
  updatedAt: '2026-10-17T04:20:06.000Z',
}
const page = (items: unknown[]) => ({ items, page: 1, pageSize: items.length, total: items.length, totalPages: 1 })

describe('toStorefrontProduct', () => {
  it('has adapter-magento\'s product shape', () => {
    expect(toStorefrontProduct(product)).toEqual({
      id: 'MjExNg==', source: 'magento', sku: 'HABIT', name: 'Habit Tracker', status: 'published', in_stock: true,
      requires_shipping: false, price: 4.99, description: '<p>Daily <b>habits</b></p>', short_description: 'Habits &amp; streaks',
      image: 'https://shop/a.jpg', gallery_images: ['https://shop/a.jpg', 'https://shop/b.jpg'],
    })
    expect(toStorefrontProduct({ ...product, images: [], attributes: { type: 'simple' } })).toMatchObject({ image: null, requires_shipping: true, description: null })
  })
})

describe('public (browser) backend', () => {
  it('reads products by SKU and by category, and has no trusted methods', async () => {
    const { client, calls } = fakeDirectus({ 'GET /commerce/products': () => page([product]) })
    const backend = createMageosDirectusBackend(client, { trusted: false })

    expect(await backend.request({ method: 'GET', collection: 'products', key: 'HABIT' })).toMatchObject({ sku: 'HABIT', source: 'magento' })
    const listings = () => calls.filter((c) => c.path === '/commerce/products')
    expect(listings()[0]!.params).toEqual({ sku: 'HABIT', limit: '1' })

    await backend.getProductsByCategory!({ slug: 'books', externalId: 'Mzg=' })
    expect(listings()[1]!.params).toMatchObject({ category: 'Mzg=' })
    await backend.getProductsByCategory!({ slug: 'books' })
    expect(listings()[2]!.params).toMatchObject({ category_slug: 'books' })

    expect(await backend.request({ method: 'GET', collection: 'orders' })).toEqual([])
    for (const method of ['placePaidOrder', 'customerOrders', 'refundOrder', 'adminOrder', 'create', 'schema'] as const) {
      expect(backend[method], method).toBeUndefined()
    }
  })

  it('returns null for an unknown SKU', async () => {
    const { client } = fakeDirectus({ 'GET /commerce/products': () => page([]) })
    expect(await createMageosDirectusBackend(client, { trusted: false }).request({ method: 'GET', collection: 'products', key: 'NOPE' })).toBeNull()
  })

  it('caps listings at 50 and passes search through', async () => {
    const { client, calls } = fakeDirectus({ 'GET /commerce/products': () => page([]) })
    await createMageosDirectusBackend(client, { trusted: false }).request({ method: 'GET', collection: 'products', params: { limit: 500, search: ' tea ' } })
    expect(calls[0]!.params).toEqual({ limit: '50', search: 'tea' })
  })
})

describe('product detail and SDK errors', () => {
  it('takes descriptions from the product\'s own route (listings leave them out)', async () => {
    const listed = { ...product, attributes: { type: 'virtual' } }
    const { client } = fakeDirectus({ 'GET /commerce/products': () => page([listed]), 'GET /commerce/products/habit': () => product })
    expect(await createMageosDirectusBackend(client, { trusted: false }).request({ method: 'GET', collection: 'products', key: 'HABIT' }))
      .toMatchObject({ description: '<p>Daily <b>habits</b></p>', short_description: 'Habits &amp; streaks' })
  })

  it('keeps the status of the real SDK\'s errors (Error objects carrying the response)', async () => {
    const sdkStyle = (status: number, message: string) => Object.assign(new Error(message), { errors: [{ message, extensions: { code: 'NOT_FOUND' } }], response: { status } })
    const client = { request: vi.fn(async () => { throw sdkStyle(404, 'Order not found') }) } as never
    const backend = createMageosDirectusBackend(client, { trusted: true })
    expect(await backend.adminOrder!('999999')).toBeNull()
    expect(await backend.customerOrder!('97', '999999')).toBeNull()
    const refusing = { request: vi.fn(async () => { throw sdkStyle(400, 'Invalid customerId') }) } as never
    await expect(createMageosDirectusBackend(refusing, { trusted: true }).placePaidOrder!({ reference: 'R', customerId: 'x', items: [], amountPaid: 0, currency: 'USD' }))
      .rejects.toMatchObject({ status: 400, message: 'Invalid customerId' })
  })
})

describe('trusted (server) backend', () => {
  it('lists admin collections and reads orders, null when missing', async () => {
    const { client } = fakeDirectus({
      'GET /commerce/admin/orders': () => [{ id: 3, number: '000000005' }],
      'GET /commerce/admin/orders/3': () => ({ id: '3', refundable: [] }),
      'GET /commerce/admin/orders/by-reference/CAP-1': () => sdkError(404, 'Order not found', 'NOT_FOUND'),
      'GET /commerce/customers/42/orders': () => [{ id: '9' }],
    })
    const backend = createMageosDirectusBackend(client, { trusted: true })
    expect(backend.collections).toEqual(['products', 'orders', 'customers', 'creditmemos'])
    expect(await backend.request({ method: 'GET', collection: 'orders' })).toEqual([{ id: 3, number: '000000005' }])
    expect(await backend.adminOrder!('3')).toEqual({ id: '3', refundable: [] })
    expect(await backend.adminOrder!('../3')).toBeNull()
    expect(await backend.orderByReference!('CAP-1')).toBeNull()
    expect(await backend.customerOrder!('42', '10')).toBeNull()
    expect(await backend.customerOrders!('42')).toEqual([{ id: '9' }])
  })

  it('sends paid orders and refunds once, and keeps the status of a refusal', async () => {
    const { client, calls } = fakeDirectus({
      'POST /commerce/orders': () => ({ id: '9', number: '000000009', created: true }),
      'POST /commerce/admin/orders/9/refund': () => sdkError(400, 'Line 99 can\'t be refunded 1×', 'INVALID_QUERY'),
    })
    const backend = createMageosDirectusBackend(client, { trusted: true })
    const order = { reference: 'CAP-1', customerId: '42', items: [{ key: 'HABIT', qty: 1 }], amountPaid: 4.99, currency: 'USD' }
    expect(await backend.placePaidOrder!(order)).toEqual({ id: '9', number: '000000009', created: true })
    expect(JSON.parse(calls[0]!.body!)).toEqual(order)

    await expect(backend.refundOrder!({ orderId: '9', items: [{ key: '99', qty: 1 }] }))
      .rejects.toMatchObject({ message: 'Line 99 can\'t be refunded 1×', status: 400, code: 'INVALID_QUERY' })
    expect(calls.filter((c) => c.path.endsWith('/refund'))).toHaveLength(1)
  })

  it('only edits customers', async () => {
    const { client } = fakeDirectus({ 'PATCH /commerce/admin/customers/5': (call) => ({ id: 5, ...JSON.parse(call.body!) }) })
    const backend = createMageosDirectusBackend(client, { trusted: true })
    expect(await backend.update!('customers', 5, { firstname: 'New' })).toEqual({ id: 5, firstname: 'New' })
    await expect(backend.update!('orders', 5, {})).rejects.toMatchObject({ status: 405 })
    await expect(backend.remove!('creditmemos', 1)).rejects.toMatchObject({ status: 405 })
  })

  it('maps sellers by SKU', async () => {
    const { client, calls } = fakeDirectus({ 'GET /commerce/sellers': () => ({ HABIT: { customerId: '97', name: 'Max Shop', shopUrl: 'max' } }) })
    expect(await createMageosDirectusBackend(client, { trusted: true }).productSellers!(['HABIT', 'HABIT', ''])).toEqual({ HABIT: { customerId: '97', name: 'Max Shop' } })
    expect(calls[0]!.params).toEqual({ sku: 'HABIT' })
  })
})

describe('integration store and customer link', () => {
  it('lists integration products with their seller, without one when that lookup fails', async () => {
    const sellers = vi.fn(() => ({ HABIT: { customerId: '97', name: 'Max Shop' } }))
    const { client } = fakeDirectus({ 'GET /commerce/products': () => page([product]), 'GET /commerce/sellers': sellers })
    const store = createMageosDirectusIntegrationStore(client)
    const expected = {
      sku: 'HABIT', ref: 'magento:HABIT', name: 'Habit Tracker', description: 'Habits & streaks', price: 4.99, currency: 'USD', image: 'https://shop/a.jpg',
    }
    expect(await store.products(['HABIT'])).toEqual([{ ...expected, seller: { id: '97', name: 'Max Shop' } }])
    sellers.mockImplementation(() => sdkError(502, 'down', 'UPSTREAM_ERROR'))
    expect(await store.products(['HABIT'])).toEqual([{ ...expected, seller: null }])
    expect(store.customerId({ magentoCustomerId: '42' })).toBe('42')
    expect(store.customerId({ magentoCustomerId: 'x' })).toBeNull()
  })

  it('creates the store customer at signup', async () => {
    const { client, calls } = fakeDirectus({ 'POST /commerce/customers': () => ({ id: '57', email: 'a@b.c', firstname: 'Ann', lastname: 'Lee', seller: null }) })
    const link = createMageosDirectusCustomerLink(client)
    expect(await link.onUserCreated({ id: 'u1', email: 'a@b.c', name: 'Ann Marie Lee', isSeller: true })).toEqual({ externalCustomerId: '57' })
    expect(JSON.parse(calls[0]!.body!)).toEqual({ firstname: 'Ann', lastname: 'Marie Lee', email: 'a@b.c', wantsToSell: true })
  })
})
