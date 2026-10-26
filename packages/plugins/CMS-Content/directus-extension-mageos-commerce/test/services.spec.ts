import { describe, expect, it, vi } from 'vitest'
import { MageOsAdapter } from '../src/adapters/mage-os.adapter'
import { toAdminOrder, toBackendOrder, toGiftCard } from '../src/adapters/mage-os.mappers'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

/** An adapter whose fetch answers by "METHOD path" (query string ignored unless the key has one). */
function fakeMagento(routes: Record<string, (init: RequestInit, url: URL) => Response>) {
  const calls: { method: string, path: string, url: URL, init: RequestInit }[] = []
  const fetch = vi.fn(async (input: string, init: RequestInit = {}) => {
    const url = new URL(input)
    const method = init.method ?? 'GET'
    calls.push({ method, path: url.pathname, url, init })
    const handler = routes[`${method} ${url.pathname}${url.search}`] ?? routes[`${method} ${url.pathname}`]
    if (!handler) return json({ message: 'Request does not match any route.' }, 404)
    return handler(init, url)
  })
  const adapter = new MageOsAdapter({ url: 'https://shop', token: 'at', consumerKey: 'ck', consumerSecret: 'cs', tokenSecret: 'ats', fetch: fetch as never, timeoutMs: 1000 })
  return { adapter, calls }
}

const restOrder = {
  entity_id: 9, increment_id: '000000009', created_at: '2026-10-20 10:00:00', state: 'processing', status: 'processing',
  order_currency_code: 'USD', grand_total: 30, subtotal: 30, tax_amount: 0, shipping_amount: 0, total_paid: 30, total_refunded: 0, total_due: 0,
  customer_id: 42, customer_email: 'a@b.c', customer_firstname: 'Ann', customer_lastname: 'Lee', ext_order_id: 'CAPTURE-1',
  items: [
    { item_id: 11, sku: 'A', name: 'Alpha', qty_ordered: 2, qty_invoiced: 2, qty_refunded: 1, price: 10, row_total: 20 },
    { item_id: 12, sku: 'B', name: 'Beta', qty_ordered: 1, qty_invoiced: 1, qty_refunded: 0, price: 10, row_total: 10 },
    { item_id: 13, sku: 'B-child', name: 'Beta child', parent_item_id: 12, qty_ordered: 1, qty_invoiced: 1, qty_refunded: 0, price: 0 },
  ],
}

describe('mappers (same output as adapter-magento)', () => {
  it('maps a Meeovi_MarketplaceApi customer order, money in cents', () => {
    expect(toBackendOrder({
      id: 9, number: '000000009', createdAt: '2026-10-20 10:00:00', status: 'complete', state: 'complete', paymentStatus: 'paid', currency: 'USD',
      grandTotal: 12.5, subtotal: 12.5, taxAmount: 0, shippingAmount: 0, totalPaid: 12.5, totalRefunded: 0, totalDue: 0,
      customer: { firstname: 'Ann', lastname: 'Lee', email: 'a@b.c' },
      items: [{ sku: 'A', name: 'Alpha', qty: 1, price: 12.5, rowTotal: 12.5 }],
      tracking: [{ number: 'TRK1', carrier: 'ups', title: 'UPS' }],
    })).toMatchObject({
      id: '9', date_created: '2026-10-20T10:00:00.000Z', fulfillment_status: 'delivered', grand_total: 1250,
      line_items_snapshot: [{ product_id: 'magento:A', quantity: 1, unit_amount: 12.5 }], tracking_number: 'TRK1', shipment_carrier: 'UPS',
    })
  })

  it('maps a core REST order with what is left to refund (child lines excluded)', () => {
    const order = toAdminOrder(restOrder)
    expect(order).toMatchObject({ id: '9', reference: 'CAPTURE-1', customer_id: '42', payment_status: 'completed', grand_total: 3000 })
    expect(order.line_items_snapshot).toHaveLength(2)
    expect(order.refundable).toEqual([
      { key: '11', name: 'Alpha', qty: 1, unit_amount: 10 },
      { key: '12', name: 'Beta', qty: 1, unit_amount: 10 },
    ])
  })

  it('fills gift-card fields Magento left out', () => {
    expect(toGiftCard({ code: 'X', balance: '5' as never })).toMatchObject({ code: 'X', state: 'pending', enabled: false, balance: 5, recipient_email: null })
  })
})

describe('MageOsAdapter services', () => {
  it('places paid orders through Meeovi_MarketplaceApi, signed, POSTed once', async () => {
    const { adapter, calls } = fakeMagento({ 'POST /rest/V1/meeovi-marketplace/orders': () => json({ order_id: 9, increment_id: '000000009', created: true }) })
    const placed = await adapter.orders.placePaid({ reference: 'CAPTURE-1', customerId: '42', items: [{ key: 'A', qty: 2 }], amountPaid: 20, currency: 'usd' })
    expect(placed).toEqual({ id: '9', number: '000000009', created: true })
    expect(JSON.parse(String(calls[0]!.init.body))).toEqual({ customerId: 42, reference: 'CAPTURE-1', items: [{ sku: 'A', qty: 2 }], amountPaid: 20, currency: 'USD' })
    expect((calls[0]!.init.headers as Record<string, string>).Authorization).toMatch(/^OAuth /)
  })

  it('asks Meeovi_MarketplaceApi for tax and decodes its JSON-string answer', async () => {
    const quote = { currency: 'USD', items: { subtotal: 14.97, discount: 0, tax: 1.24, grandTotal: 16.21 }, otherLines: [{ reference: 'p1', tax: 0.83 }], otherTax: 0.83, shippingTax: 0, pricesIncludeTax: false, shippingIncludesTax: false }
    const { adapter, calls } = fakeMagento({ 'POST /rest/V1/meeovi-marketplace/tax/quote': () => json(JSON.stringify(quote)) })
    const result = await adapter.orders.quoteTax({
      currency: 'usd', customerId: '42', items: [{ key: 'A', qty: 3 }], otherLines: [{ reference: 'p1', price: 10, qty: 1 }],
      shippingAmount: 5, address: { country_id: 'US', region_code: 'MI' },
    })
    expect(result).toEqual(quote)
    expect(JSON.parse(String(calls[0]!.init.body))).toEqual({
      customerId: 42, items: [{ sku: 'A', qty: 3 }], otherLines: [{ reference: 'p1', price: 10, qty: 1 }], shippingAmount: 5, currency: 'USD',
      address: { country_id: 'US', region_code: 'MI' },
    })
  })

  it('quotes tax without a customer when there are no store products', async () => {
    const { adapter, calls } = fakeMagento({ 'POST /rest/V1/meeovi-marketplace/tax/quote': () => json(JSON.stringify({ items: null })) })
    await adapter.orders.quoteTax({ currency: 'USD', items: [], otherLines: [{ reference: 'p1', price: 10, qty: 1 }] })
    expect(JSON.parse(String(calls[0]!.init.body))).toMatchObject({ customerId: 0, items: [], shippingAmount: 0 })
    expect(JSON.parse(String(calls[0]!.init.body))).not.toHaveProperty('address')
  })

  it('never retries a write, even on 503', async () => {
    const { adapter, calls } = fakeMagento({ 'POST /rest/V1/meeovi-marketplace/orders': () => new Response('', { status: 503 }) })
    await expect(adapter.orders.placePaid({ reference: 'R', customerId: '1', items: [], amountPaid: 1, currency: 'USD' })).rejects.toMatchObject({ code: 'UPSTREAM_UNAVAILABLE' })
    expect(calls).toHaveLength(1)
  })

  it('decodes JSON-string bodies (customer orders) and returns null for someone else\'s order', async () => {
    const order = { id: 9, number: '9', createdAt: '2026-10-20 10:00:00', status: 'pending', state: 'new', paymentStatus: 'paid', currency: 'USD', grandTotal: 1, subtotal: 1, taxAmount: 0, shippingAmount: 0, totalPaid: 1, totalRefunded: 0, totalDue: 0 }
    const { adapter } = fakeMagento({
      'GET /rest/V1/meeovi-marketplace/customers/42/orders': () => json(JSON.stringify([order])),
      'GET /rest/V1/meeovi-marketplace/customers/42/orders/10': () => json({ message: 'Order not found' }, 404),
    })
    expect((await adapter.orders.forCustomer('42', 1, 50)).map((o) => o.id)).toEqual(['9'])
    expect(await adapter.orders.oneForCustomer('42', '10')).toBeNull()
  })

  it('maps sellers by SKU', async () => {
    const { adapter, calls } = fakeMagento({ 'GET /rest/V1/meeovi-marketplace/products/sellers': () => json([{ sku: 'A', seller_id: 7, shop_title: ' Max Shop ', shop_url: 'max' }]) })
    expect(await adapter.sellers.forSkus(['A', 'B', 'A'])).toEqual({ A: { customerId: '7', name: 'Max Shop', shopUrl: 'max' } })
    expect(calls[0]!.url.searchParams.getAll('skus[0]').concat(calls[0]!.url.searchParams.getAll('skus[1]'))).toEqual(['A', 'B'])
  })

  it('registers sellers with the customer\'s own token (self-scoped)', async () => {
    const { adapter, calls } = fakeMagento({ 'POST /rest/V1/meeovi-marketplace/seller/register': () => json({ sellerRecordId: 3, isApproved: false, shopUrl: 'ann' }) })
    await adapter.sellers.register('42', 'customer-jwt')
    expect((calls[0]!.init.headers as Record<string, string>).Authorization).toBe('Bearer customer-jwt')
  })

  it('creates a customer and reads the id from the customer token', async () => {
    const jwt = `x.${Buffer.from(JSON.stringify({ uid: 57 })).toString('base64url')}.y`
    const fetch = vi.fn(async (_url: string, init: RequestInit = {}) => {
      const query = JSON.parse(String(init.body)).query as string
      if (query.includes('createCustomerV2')) return json({ data: { createCustomerV2: { customer: { email: 'a@b.c', firstname: 'Ann', lastname: 'Lee' } } } })
      return json({ data: { generateCustomerToken: { token: jwt } } })
    })
    const adapter = new MageOsAdapter({ url: 'https://shop', fetch: fetch as never })
    expect(await adapter.customers.create({ firstname: 'Ann', lastname: 'Lee', email: 'a@b.c' })).toEqual({ id: '57', email: 'a@b.c', firstname: 'Ann', lastname: 'Lee', seller: null })
    // Mutations go by POST.
    expect(fetch.mock.calls.every(([, init]) => init?.method === 'POST')).toBe(true)
  })

  it('maps a duplicate-email GraphQL error to REJECTED', async () => {
    const adapter = new MageOsAdapter({ url: 'https://shop', fetch: (async () => json({ errors: [{ message: 'A customer with the same email address already exists.', extensions: { category: 'graphql-input' } }] })) as never })
    await expect(adapter.customers.create({ firstname: 'A', lastname: 'B', email: 'a@b.c' })).rejects.toMatchObject({ code: 'REJECTED', status: 422 })
  })

  it('refunds only what is refundable, as an offline credit memo', async () => {
    const { adapter, calls } = fakeMagento({
      'GET /rest/V1/orders/9': () => json(restOrder),
      'POST /rest/V1/order/9/refund': () => json(31),
    })
    await expect(adapter.admin.refund({ orderId: '9', items: [{ key: '11', qty: 2 }] })).rejects.toMatchObject({ code: 'INVALID_QUERY' })
    expect(await adapter.admin.refund({ orderId: '9', comment: 'Sorry' })).toEqual({ creditMemoId: '31' })
    const refund = JSON.parse(String(calls.at(-1)!.init.body))
    expect(refund.items).toEqual([{ order_item_id: 11, qty: 1 }, { order_item_id: 12, qty: 1 }])
    expect(refund.comment).toEqual({ comment: 'Sorry', is_visible_on_front: 0 })
  })

  it('edits customers by merging onto the current record (Magento PUT replaces it)', async () => {
    const { adapter, calls } = fakeMagento({
      'GET /rest/V1/customers/5': () => json({ id: 5, email: 'old@x.y', firstname: 'Old', lastname: 'Name', group_id: 1, website_id: 1, addresses: [] }),
      'PUT /rest/V1/customers/5': (init) => json(JSON.parse(String(init.body)).customer),
    })
    const row = await adapter.admin.updateCustomer('5', { firstname: 'New', website_id: 9, password: 'nope' })
    expect(row).toMatchObject({ id: 5, firstname: 'New', email: 'old@x.y', website_id: 1 })
    expect(JSON.parse(String(calls.at(-1)!.init.body)).customer).toMatchObject({ addresses: [], firstname: 'New' })
    expect(JSON.parse(String(calls.at(-1)!.init.body)).customer).not.toHaveProperty('password')
  })

  it('names a missing Mage-OS module instead of saying "not found"', async () => {
    const { adapter } = fakeMagento({})
    await expect(adapter.giftCards.received('a@b.c')).rejects.toMatchObject({ code: 'UPSTREAM_ERROR', message: expect.stringContaining('module installed') })
  })

  it('surfaces Magento validation messages as REJECTED', async () => {
    const { adapter } = fakeMagento({ 'POST /rest/V1/meeovi-marketplace/sync/stock': () => json({ message: 'SKU "%1" is not linked to seller %2', parameters: ['A', '7'] }, 400) })
    await expect(adapter.catalogSync.updateStock({ customerId: 7, sku: 'A', qty: 1 })).rejects.toMatchObject({ code: 'REJECTED', message: 'SKU "A" is not linked to seller 7' })
  })
})
