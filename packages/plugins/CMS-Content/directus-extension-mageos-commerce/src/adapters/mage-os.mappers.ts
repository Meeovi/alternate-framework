import type { AdminCollection, BackendAdminOrder, BackendField, BackendGiftCard, BackendOrder } from '../types'

/**
 * Magento REST rows → the app's commerce contract. Ported unchanged from
 * adapter-magento's runtime/commerce-backend.ts so both paths return the
 * same shapes. Order money is in minor units (cents).
 */

/** A customer's order as Meeovi_MarketplaceApi returns it. */
export interface MagentoCustomerOrder {
  id: number
  number: string
  createdAt: string
  status: string
  state: string
  paymentStatus: string
  currency: string
  grandTotal: number
  subtotal: number
  taxAmount: number
  shippingAmount: number
  totalPaid: number
  totalRefunded: number
  totalDue: number
  customer?: { firstname?: string, lastname?: string, email?: string }
  items?: { sku: string, name: string, qty: number, price: number, rowTotal: number }[]
  tracking?: { number?: string, carrier?: string, title?: string }[]
}

export const cents = (amount: unknown) => Math.round((Number(amount) || 0) * 100)
const num = (value: unknown) => (value == null || value === '' ? 0 : Number(value))
export const magentoDate = (value: unknown) =>
  (typeof value === 'string' && value ? new Date(/T|Z$/.test(value) ? value : `${value.replace(' ', 'T')}Z`).toISOString() : null)

export function toBackendOrder(order: MagentoCustomerOrder): BackendOrder {
  const track = order.tracking?.[0]
  return {
    id: String(order.id),
    number: order.number,
    date_created: magentoDate(order.createdAt) ?? '',
    payment_status: order.paymentStatus,
    fulfillment_status: order.state === 'complete' ? 'delivered' : order.state === 'canceled' ? 'cancelled' : order.status,
    order_currency_code: order.currency,
    grand_total: cents(order.grandTotal),
    subtotal: cents(order.subtotal),
    tax_amount: cents(order.taxAmount),
    shipping_amount: cents(order.shippingAmount),
    total_paid: cents(order.totalPaid),
    total_refunded: cents(order.totalRefunded),
    total_due: cents(order.totalDue),
    customer_firstname: order.customer?.firstname || null,
    customer_lastname: order.customer?.lastname || null,
    customer_email: order.customer?.email || null,
    line_items_snapshot: (order.items ?? []).map((item) => ({
      product_id: `magento:${item.sku}`,
      name: item.name,
      quantity: item.qty,
      unit_amount: item.price,
      subtotal: item.rowTotal,
    })),
    tracking_number: track?.number || null,
    tracking_url: null,
    shipment_carrier: track?.title || track?.carrier || null,
  }
}

/** A core REST order (GET /V1/orders/:id) with what's left to refund per line. */
export function toAdminOrder(o: any): BackendAdminOrder {
  const lines = (o.items ?? []).filter((item: any) => !item.parent_item_id)
  return {
    id: String(o.entity_id),
    number: o.increment_id,
    date_created: magentoDate(o.created_at) ?? '',
    payment_status: num(o.total_refunded) >= num(o.grand_total) && num(o.grand_total) > 0 ? 'refunded' : o.state === 'canceled' ? 'cancelled' : num(o.total_paid) > 0 ? 'completed' : 'pending',
    fulfillment_status: o.status,
    order_currency_code: o.order_currency_code,
    grand_total: cents(o.grand_total),
    subtotal: cents(o.subtotal),
    tax_amount: cents(o.tax_amount),
    shipping_amount: cents(o.shipping_amount),
    total_paid: cents(o.total_paid),
    total_refunded: cents(o.total_refunded),
    total_due: cents(o.total_due),
    customer_firstname: o.customer_firstname ?? null,
    customer_lastname: o.customer_lastname ?? null,
    customer_email: o.customer_email ?? null,
    line_items_snapshot: lines.map((item: any) => ({
      product_id: `magento:${item.sku}`, name: item.name, quantity: num(item.qty_ordered),
      unit_amount: num(item.price_incl_tax ?? item.price), subtotal: num(item.row_total_incl_tax ?? item.row_total),
    })),
    reference: o.ext_order_id || null,
    customer_id: o.customer_id ? String(o.customer_id) : null,
    refundable: lines
      .map((item: any) => ({ key: String(item.item_id), name: item.name, qty: num(item.qty_invoiced) - num(item.qty_refunded), unit_amount: num(item.price_incl_tax ?? item.price) }))
      .filter((line: { qty: number }) => line.qty > 0),
  }
}

/** Magento's REST output can leave null fields out. */
export const toGiftCard = (c: Partial<BackendGiftCard> & Record<string, unknown>): BackendGiftCard => ({
  code: c.code ?? null,
  state: c.state ?? 'pending',
  enabled: !!c.enabled,
  balance: c.balance == null ? null : Number(c.balance),
  created_at: c.created_at ?? null,
  expires_at: c.expires_at ?? null,
  recipient_name: c.recipient_name ?? null,
  recipient_email: c.recipient_email ?? null,
  sender_name: c.sender_name ?? null,
  sender_email: c.sender_email ?? null,
  product_name: c.product_name ?? null,
  product_sku: c.product_sku ?? null,
  order_number: c.order_number ?? null,
  message: c.message ?? null,
})

// Admin table rows: flat, in the store's currency units.
export const customerRow = (c: any) => ({
  id: c.id, email: c.email, firstname: c.firstname, lastname: c.lastname, group_id: c.group_id,
  website_id: c.website_id, created_at: magentoDate(c.created_at), updated_at: magentoDate(c.updated_at),
})
export const orderRow = (o: any) => ({
  id: o.entity_id,
  number: o.increment_id,
  status: o.status,
  customer_email: o.customer_email ?? null,
  customer_name: [o.customer_firstname, o.customer_lastname].filter(Boolean).join(' ') || null,
  grand_total: num(o.grand_total),
  total_refunded: num(o.total_refunded),
  currency: o.order_currency_code,
  reference: o.ext_order_id || null,
  created_at: magentoDate(o.created_at),
})
export const creditMemoRow = (m: any) => ({
  id: m.entity_id, number: m.increment_id, order_id: m.order_id, grand_total: num(m.grand_total),
  currency: m.order_currency_code, created_at: magentoDate(m.created_at),
})

export const ADMIN_SCHEMAS: Record<AdminCollection, BackendField[]> = {
  customers: [
    { field: 'id', label: 'ID', type: 'number', primary: true, readonly: true },
    { field: 'email', label: 'Email', type: 'string', required: true },
    { field: 'firstname', label: 'First name', type: 'string', required: true },
    { field: 'lastname', label: 'Last name', type: 'string', required: true },
    { field: 'group_id', label: 'Group', type: 'number' },
    { field: 'website_id', label: 'Website', type: 'number', readonly: true },
    { field: 'created_at', label: 'Created', type: 'datetime', readonly: true },
    { field: 'updated_at', label: 'Updated', type: 'datetime', readonly: true },
  ],
  orders: [
    { field: 'id', label: 'ID', type: 'number', primary: true, readonly: true },
    { field: 'number', label: 'Order', type: 'string', readonly: true },
    { field: 'status', label: 'Status', type: 'string', readonly: true },
    { field: 'customer_email', label: 'Customer', type: 'string', readonly: true },
    { field: 'customer_name', label: 'Name', type: 'string', readonly: true },
    { field: 'grand_total', label: 'Total', type: 'number', readonly: true },
    { field: 'total_refunded', label: 'Refunded', type: 'number', readonly: true },
    { field: 'currency', label: 'Currency', type: 'string', readonly: true },
    { field: 'reference', label: 'Payment', type: 'string', readonly: true },
    { field: 'created_at', label: 'Placed', type: 'datetime', readonly: true },
  ],
  creditmemos: [
    { field: 'id', label: 'ID', type: 'number', primary: true, readonly: true },
    { field: 'number', label: 'Credit memo', type: 'string', readonly: true },
    { field: 'order_id', label: 'Order ID', type: 'number', readonly: true },
    { field: 'grand_total', label: 'Refunded', type: 'number', readonly: true },
    { field: 'currency', label: 'Currency', type: 'string', readonly: true },
    { field: 'created_at', label: 'Created', type: 'datetime', readonly: true },
  ],
}

/** Customer fields an admin may set (Magento's PUT replaces the whole record). */
const CUSTOMER_FIELDS = ['email', 'firstname', 'lastname', 'group_id'] as const
export const pickCustomer = (data: Record<string, unknown>) =>
  Object.fromEntries(CUSTOMER_FIELDS.filter((k) => data[k] !== undefined).map((k) => [k, k === 'group_id' ? Number(data[k]) : data[k]]))

/** Core REST searchCriteria: AND-ed filters, newest first. */
export function searchCriteria(filters: { field: string, value: string, condition?: string }[], pageSize: number, sortField = 'entity_id'): string {
  const query = new URLSearchParams()
  filters.forEach((filter, i) => {
    query.set(`searchCriteria[filterGroups][${i}][filters][0][field]`, filter.field)
    query.set(`searchCriteria[filterGroups][${i}][filters][0][value]`, filter.value)
    query.set(`searchCriteria[filterGroups][${i}][filters][0][conditionType]`, filter.condition ?? 'eq')
  })
  query.set('searchCriteria[pageSize]', String(pageSize))
  query.set('searchCriteria[currentPage]', '1')
  query.set('searchCriteria[sortOrders][0][field]', sortField)
  query.set('searchCriteria[sortOrders][0][direction]', 'DESC')
  return query.toString()
}
