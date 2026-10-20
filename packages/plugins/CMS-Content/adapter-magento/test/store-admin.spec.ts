import { describe, it, expect, vi } from 'vitest'
import { MagentoAdapter } from '../src/index'
import { createMagentoCommerceBackendAdapter } from '../src/runtime/commerce-backend'

// /workspace store admin through the Integration: customers table writes,
// admin order lookups and offline refunds (credit memos).
const credentials = { consumerKey: 'ck', consumerSecret: 'cs', accessToken: 'at', accessTokenSecret: 'ats' }

const order = {
  entity_id: 3,
  increment_id: '000000005',
  ext_order_id: 'pi_123',
  customer_id: 113,
  customer_email: 'qa@example.com',
  customer_firstname: 'Q',
  customer_lastname: 'A',
  order_currency_code: 'USD',
  created_at: '2026-10-17 05:16:30',
  state: 'complete',
  status: 'complete',
  grand_total: 14.97, subtotal: 14.97, total_paid: 14.97, total_refunded: 4.99, total_due: 0,
  items: [
    { item_id: 7, sku: 'habit', name: 'Habit Tracker', qty_ordered: 2, qty_invoiced: 2, qty_refunded: 1, price: 4.99, price_incl_tax: 4.99, row_total: 9.98 },
    { item_id: 8, sku: 'kanban', name: 'Kanban', qty_ordered: 1, qty_invoiced: 1, qty_refunded: 0, price: 4.99, price_incl_tax: 4.99, row_total: 4.99 },
    { item_id: 9, parent_item_id: 8, sku: 'child', name: 'child row', qty_ordered: 1, qty_invoiced: 1, qty_refunded: 0, price: 0 },
  ],
}

function setup() {
  const magento = new MagentoAdapter('http://fake-magento.test/graphql')
  const admin = {
    customers: vi.fn().mockResolvedValue({ items: [{ id: 1, email: 'a@x.io', firstname: 'A', lastname: 'B', group_id: 1, website_id: 1, created_at: '2026-01-02 03:04:05', addresses: [{ id: 9 }] }], total_count: 1 }),
    customer: vi.fn().mockResolvedValue({ id: 1, email: 'a@x.io', firstname: 'A', lastname: 'B', group_id: 1, website_id: 1, addresses: [{ id: 9 }], custom_attributes: [] }),
    createCustomer: vi.fn().mockImplementation(async (_c, customer) => ({ id: 2, ...customer })),
    saveCustomer: vi.fn().mockImplementation(async (_c, _id, customer) => customer),
    deleteCustomer: vi.fn().mockResolvedValue(true),
    orders: vi.fn().mockResolvedValue({ items: [order], total_count: 1 }),
    order: vi.fn().mockResolvedValue(order),
    creditMemos: vi.fn().mockResolvedValue({ items: [], total_count: 0 }),
    refundOrder: vi.fn().mockResolvedValue(41),
  }
  ;(magento as any).admin = admin
  return { magento, admin, adapter: createMagentoCommerceBackendAdapter(magento, credentials, { websiteId: 1 }) }
}

describe('store admin tables', () => {
  it('only serves customers and credit memos with the Integration', () => {
    expect(createMagentoCommerceBackendAdapter(new MagentoAdapter('http://x.test/graphql')).collections).toEqual(['products', 'orders'])
    expect(setup().adapter.collections).toEqual(['products', 'orders', 'customers', 'creditmemos'])
  })

  it('lists customers and orders as flat rows', async () => {
    const { adapter } = setup()
    expect(await adapter.request({ method: 'GET', collection: 'customers' })).toEqual([
      expect.objectContaining({ id: 1, email: 'a@x.io', created_at: '2026-01-02T03:04:05.000Z' }),
    ])
    const [row] = await adapter.request({ method: 'GET', collection: 'orders' })
    expect(row).toMatchObject({ id: 3, number: '000000005', reference: 'pi_123', customer_name: 'Q A', grand_total: 14.97, total_refunded: 4.99 })
    expect(await adapter.schema!('orders')).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'id', primary: true })]))
  })

  it('creates customers on the configured website, with only the admin fields', async () => {
    const { adapter, admin } = setup()
    await adapter.create!('customers', { email: 'n@x.io', firstname: 'N', lastname: 'M', website_id: 9, password: 'nope', group_id: '3' })
    expect(admin.createCustomer).toHaveBeenCalledWith(credentials, { email: 'n@x.io', firstname: 'N', lastname: 'M', group_id: 3, website_id: 1 })
  })

  it('updates send the whole customer (Magento\'s PUT replaces it), changing only admin fields', async () => {
    const { adapter, admin } = setup()
    await adapter.update!('customers', '1', { lastname: 'C', website_id: 5, addresses: [] })
    expect(admin.saveCustomer).toHaveBeenCalledWith(credentials, 1, expect.objectContaining({ id: 1, lastname: 'C', website_id: 1, addresses: [{ id: 9 }] }))
  })

  it('deletes customers; refuses writes to other tables', async () => {
    const { adapter, admin } = setup()
    await adapter.remove!('customers', 1)
    expect(admin.deleteCustomer).toHaveBeenCalledWith(credentials, 1)
    await expect(adapter.remove!('orders', 3)).rejects.toMatchObject({ status: 405 })
    await expect(adapter.update!('customers', 'x', {})).rejects.toMatchObject({ status: 400 })
  })
})

describe('admin orders and refunds', () => {
  it('reports what is left to refund per line (child rows skipped)', async () => {
    const { adapter } = setup()
    const result = await adapter.adminOrder!('3')
    expect(result).toMatchObject({ number: '000000005', reference: 'pi_123', customer_id: '113', total_refunded: 499 })
    expect(result!.refundable).toEqual([
      { key: '7', name: 'Habit Tracker', qty: 1, unit_amount: 4.99 },
      { key: '8', name: 'Kanban', qty: 1, unit_amount: 4.99 },
    ])
    expect(await adapter.adminOrder!('abc')).toBeNull()
  })

  it('finds an order by its payment reference', async () => {
    const { adapter, admin } = setup()
    await adapter.orderByReference!('pi_123')
    expect(admin.orders).toHaveBeenCalledWith(credentials, [{ field: 'ext_order_id', value: 'pi_123' }], 1)
  })

  it('refunds everything left without items, or the chosen lines', async () => {
    const { adapter, admin } = setup()
    expect(await adapter.refundOrder!({ orderId: '3', comment: 'why' })).toEqual({ creditMemoId: '41' })
    expect(admin.refundOrder).toHaveBeenLastCalledWith(credentials, 3, { items: [{ order_item_id: 7, qty: 1 }, { order_item_id: 8, qty: 1 }], comment: 'why' })
    await adapter.refundOrder!({ orderId: '3', items: [{ key: '8', qty: 1 }] })
    expect(admin.refundOrder).toHaveBeenLastCalledWith(credentials, 3, { items: [{ order_item_id: 8, qty: 1 }] })
  })

  it('refuses more than is left, unknown lines, and orders with nothing left', async () => {
    const { adapter, admin } = setup()
    await expect(adapter.refundOrder!({ orderId: '3', items: [{ key: '7', qty: 2 }] })).rejects.toMatchObject({ status: 400 })
    await expect(adapter.refundOrder!({ orderId: '3', items: [{ key: '99', qty: 1 }] })).rejects.toMatchObject({ status: 400 })
    admin.order.mockResolvedValueOnce({ ...order, items: order.items.map((i) => ({ ...i, qty_refunded: i.qty_invoiced })) })
    await expect(adapter.refundOrder!({ orderId: '3' })).rejects.toMatchObject({ status: 409 })
    expect(admin.refundOrder).not.toHaveBeenCalled()
  })
})
