import type {
  BackendAdminOrder, BackendField, BackendGiftCard, BackendOrder, BackendRefund, CategoryProductsRef, CommerceBackendAdapter, DirectusRequestDescriptor, PaidOrder,
} from 'alternate-sdk'
import type { MagentoAdapter, MagentoCustomerOrder, MagentoGiftCard, MagentoOAuth1Credentials } from '@mframework/adapter-magento'
// Self-referencing package import, not a relative path — nuxt-module-build
// only compiles module.ts and runtime/** into dist/, so a relative
// '../normalizers/normalizers' import would resolve to a dist/normalizers/
// that's never generated (see the exports["./normalizers"] entry in
// package.json, which points at the TS source directly, same as ".").
import { magentoNormalizers } from '@mframework/adapter-magento/normalizers'

// Field list is shaped to match exactly what magentoNormalizers.products
// (normalizers/products.ts) actually reads — nested selections use the
// { field: [...subfields] } form MagentoAdapter's parseFieldsToQuery
// expects. Categories are deliberately NOT normalized/exposed as a
// collection here — "departments"/"categories" are Directus-only CMS
// taxonomy; this adapter only ever resolves a category_uid internally
// (resolveCategoryUid below) to scope a products query, see
// getProductsByCategory on the returned adapter.
const PRODUCT_FIELDS = [
  '__typename', 'id', 'uid', 'sku', 'name', 'status', 'stock_status',
  { price_range: [{ minimum_price: [{ final_price: ['value'] }] }] },
  { description: ['html'] },
  { short_description: ['html'] },
  { small_image: ['url'] },
  { image: ['url'] },
  { media_gallery: ['url'] },
]

// Real Magento's storefront schema exposes products/categories as
// paginated, search-style root fields (`products(filter/search/pageSize)`,
// `categories(filters/pageSize)`), each returning `{ items, total_count }`
// — not the singular per-entity fields MagentoAdapter.store.readEntity's
// candidate matching assumes. queryField() below calls the real field
// names directly with their real (and differently-named: filter vs
// filters) argument shapes.

async function fetchProducts(magento: MagentoAdapter, key?: string | number) {
  // Real Magento requires either `search` or `filter` on the products
  // field — there's no "list everything" mode. `search: ''` is confirmed
  // (against the live schema) to satisfy that requirement and return
  // every product; a key does an exact-sku lookup instead. Arbitrary
  // Directus-style filter objects aren't translated to Magento's per-field
  // operator shape (eq/like/in/...) — that's a documented gap.
  const args = key
    ? { filter: { sku: { eq: String(key) } } }
    : { search: '' }

  const result = await magento.store.queryField('products', {
    ...args,
    pageSize: 50,
  }, { fields: [{ items: PRODUCT_FIELDS }, 'total_count'] })

  return (result?.items ?? []).map((item: any) => magentoNormalizers.products(item))
}

// Resolves a Directus department/category into a Magento category_uid.
// externalId (departments.relative_id / categories.uid, when populated) is
// already assumed to be the Magento category_uid, so it skips the lookup
// round trip entirely; otherwise falls back to a slug -> url_key lookup.
async function resolveCategoryUid(magento: MagentoAdapter, ref: CategoryProductsRef): Promise<string | null> {
  if (ref.externalId) return ref.externalId

  const result = await magento.store.queryField('categories', {
    filters: { url_key: { eq: ref.slug } },
    pageSize: 1,
  }, { fields: [{ items: ['uid'] }] })

  return result?.items?.[0]?.uid ?? null
}

async function fetchProductsByCategoryUid(magento: MagentoAdapter, categoryUid: string) {
  const result = await magento.store.queryField('products', {
    filter: { category_uid: { eq: categoryUid } },
    pageSize: 50,
  }, { fields: [{ items: PRODUCT_FIELDS }, 'total_count'] })

  return (result?.items ?? []).map((item: any) => magentoNormalizers.products(item))
}

const cents = (amount: number) => Math.round((Number(amount) || 0) * 100)

/** A Magento order in the app's order shape (alternate-sdk BackendOrder). */
function toBackendOrder(order: MagentoCustomerOrder): BackendOrder {
  const track = order.tracking?.[0]
  return {
    id: String(order.id),
    number: order.number,
    date_created: order.createdAt ? new Date(order.createdAt.replace(' ', 'T') + 'Z').toISOString() : '',
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

// ---------------------------------------------------------------------------
// Store admin (the app's /workspace tables and refunds), through the
// Integration. Rows are flat and in the store's currency units.

const ADMIN_SCHEMAS: Record<string, BackendField[]> = {
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

const magentoDate = (value: unknown) => (typeof value === 'string' && value ? new Date(value.replace(' ', 'T') + 'Z').toISOString() : null)
const num = (value: unknown) => (value == null || value === '' ? 0 : Number(value))

const customerRow = (c: any) => ({
  id: c.id, email: c.email, firstname: c.firstname, lastname: c.lastname, group_id: c.group_id,
  website_id: c.website_id, created_at: magentoDate(c.created_at), updated_at: magentoDate(c.updated_at),
})
const orderRow = (o: any) => ({
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
const creditMemoRow = (m: any) => ({
  id: m.entity_id, number: m.increment_id, order_id: m.order_id, grand_total: num(m.grand_total),
  currency: m.order_currency_code, created_at: magentoDate(m.created_at),
})

/** A core REST order as an admin order, with what's left to refund per line. */
// Magento's REST output can leave null fields out.
const toGiftCard = (c: Partial<MagentoGiftCard>): BackendGiftCard => ({
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

function toAdminOrder(o: any): BackendAdminOrder {
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
      .map((item: any) => ({ key: String(item.item_id), sku: item.sku, name: item.name, qty: num(item.qty_invoiced) - num(item.qty_refunded), unit_amount: num(item.price_incl_tax ?? item.price) }))
      .filter((line: { qty: number }) => line.qty > 0)
      .map(({ key, name, qty, unit_amount }: any) => ({ key, name, qty, unit_amount })),
  }
}

/** Customer fields an admin may set (Magento's PUT replaces the whole record). */
const CUSTOMER_FIELDS = ['email', 'firstname', 'lastname', 'group_id'] as const
const pickCustomer = (data: Record<string, unknown>) =>
  Object.fromEntries(CUSTOMER_FIELDS.filter((k) => data[k] !== undefined).map((k) => [k, k === 'group_id' ? Number(data[k]) : data[k]]))

function storeAdmin(magento: MagentoAdapter, credentials: MagentoOAuth1Credentials, options: { websiteId: number }) {
  const integerKey = (key: string | number) => {
    const id = Number(key)
    if (!Number.isInteger(id) || id <= 0) throw Object.assign(new Error('Invalid id'), { status: 400 })
    return id
  }
  return {
    async list(collection: string): Promise<Record<string, unknown>[]> {
      if (collection === 'customers') return (await magento.admin.customers(credentials)).items.map(customerRow)
      if (collection === 'orders') return (await magento.admin.orders(credentials)).items.map(orderRow)
      if (collection === 'creditmemos') return (await magento.admin.creditMemos(credentials)).items.map(creditMemoRow)
      throw new Error(`magento commerce-backend adapter: unmapped collection "${collection}"`)
    },
    async schema(collection: string) {
      return ADMIN_SCHEMAS[collection] ?? null
    },
    async create(collection: string, data: Record<string, unknown>) {
      if (collection !== 'customers') throw Object.assign(new Error(`Can't create ${collection} here`), { status: 405 })
      return customerRow(await magento.admin.createCustomer(credentials, { ...pickCustomer(data), website_id: options.websiteId }))
    },
    async update(collection: string, key: string | number, data: Record<string, unknown>) {
      if (collection !== 'customers') throw Object.assign(new Error(`Can't edit ${collection} here`), { status: 405 })
      const id = integerKey(key)
      const current = await magento.admin.customer(credentials, id)
      return customerRow(await magento.admin.saveCustomer(credentials, id, { ...current, ...pickCustomer(data), id }))
    },
    async remove(collection: string, key: string | number) {
      if (collection !== 'customers') throw Object.assign(new Error(`Can't delete ${collection} here`), { status: 405 })
      await magento.admin.deleteCustomer(credentials, integerKey(key))
    },
    async adminOrder(orderId: string) {
      if (!/^\d+$/.test(orderId)) return null
      const order = await magento.admin.order(credentials, Number(orderId))
      return order ? toAdminOrder(order) : null
    },
    async orderByReference(reference: string) {
      const { items } = await magento.admin.orders(credentials, [{ field: 'ext_order_id', value: reference }], 1)
      return items[0] ? toAdminOrder(items[0]) : null
    },
    async refundOrder(refund: BackendRefund) {
      const order = await magento.admin.order(credentials, integerKey(refund.orderId))
      if (!order) throw Object.assign(new Error('Order not found'), { status: 404 })
      const refundable = toAdminOrder(order).refundable
      const wanted = refund.items?.length ? refund.items : refundable.map((line) => ({ key: line.key, qty: line.qty }))
      for (const item of wanted) {
        const line = refundable.find((l) => l.key === String(item.key))
        if (!line || !(item.qty > 0) || item.qty > line.qty) throw Object.assign(new Error(`Line ${item.key} can't be refunded ${item.qty}×`), { status: 400 })
      }
      if (!wanted.length) throw Object.assign(new Error('Nothing left to refund on this order'), { status: 409 })
      const id = await magento.admin.refundOrder(credentials, Number(order.entity_id), {
        items: wanted.map((item) => ({ order_item_id: Number(item.key), qty: item.qty })),
        ...(refund.comment ? { comment: refund.comment } : {}),
      })
      return { creditMemoId: String(id) }
    },
  }
}

/**
 * `credentials` (the Magento Integration, server-side only) enables
 * placePaidOrder: orders paid with the app's PayPal checkout are recorded
 * in Magento (Meeovi_MarketplaceApi ExternalOrderManagement), where Webkul
 * credits each seller's sale.
 */
export function createMagentoCommerceBackendAdapter(
  magento: MagentoAdapter,
  credentials?: MagentoOAuth1Credentials | null,
  options: { websiteId?: number } = {},
): CommerceBackendAdapter {
  const admin = credentials ? storeAdmin(magento, credentials, { websiteId: options.websiteId ?? 1 }) : null

  const placePaidOrder = credentials
    ? async (order: PaidOrder) => {
        const customerId = Number(order.customerId)
        if (!Number.isInteger(customerId) || customerId <= 0) throw new Error('No Magento customer for this buyer')
        const placed = await magento.marketplaceOrders.placeOrder(credentials, {
          customerId,
          reference: order.reference,
          items: order.items.map((item) => ({ sku: String(item.key), qty: item.qty })),
          amountPaid: order.amountPaid,
          currency: order.currency.toUpperCase(),
          ...(order.billingAddress ? { billingAddress: order.billingAddress } : {}),
        })
        return { id: String(placed.order_id), number: placed.increment_id, created: placed.created }
      }
    : undefined

  // Order history and sellers live in Magento; reading them needs the Integration too.
  const orders = credentials
    ? {
        async customerOrders(customerId: string, options?: { page?: number, pageSize?: number }) {
          const rows = await magento.marketplaceOrders.customerOrders(credentials, Number(customerId), options?.page ?? 1, options?.pageSize ?? 50)
          return rows.map(toBackendOrder)
        },
        async customerOrder(customerId: string, orderId: string) {
          if (!/^\d+$/.test(orderId)) return null
          const row = await magento.marketplaceOrders.customerOrder(credentials, Number(customerId), Number(orderId))
          return row ? toBackendOrder(row) : null
        },
        // Webkul sellers, by SKU (Meeovi_MarketplaceApi products/sellers).
        async productSellers(skus: string[]) {
          const wanted = [...new Set(skus.filter(Boolean))].slice(0, 100)
          if (!wanted.length) return {}
          const rows = await magento.marketplaceOrders.productSellers(credentials, wanted)
          return Object.fromEntries(rows.map((row) => [row.sku, { customerId: String(row.seller_id), name: row.shop_title?.trim() || null }]))
        },
        // Gift cards (Meeovi_GiftCards module): products through the
        // storefront, the customer's cards through the Integration.
        async giftCardProducts() {
          const skus = (await magento.giftCards.productSkus(credentials)).slice(0, 100)
          if (!skus.length) return []
          const result = await magento.store.queryField('products', { filter: { sku: { in: skus } }, pageSize: skus.length }, {
            fields: [{ items: PRODUCT_FIELDS }],
          })
          return (result?.items ?? []).map((item: any) => magentoNormalizers.products(item))
        },
        async receivedGiftCards(email: string) {
          return (await magento.giftCards.received(credentials, email)).map(toGiftCard)
        },
        async purchasedGiftCards(customerId: string) {
          if (!/^\d+$/.test(customerId)) return []
          return (await magento.giftCards.purchased(credentials, Number(customerId))).map(toGiftCard)
        },
      }
    : {}

  return {
    ...(placePaidOrder ? { placePaidOrder } : {}),
    ...orders,
    ...(admin ? {
      schema: admin.schema,
      create: admin.create,
      update: admin.update,
      remove: admin.remove,
      adminOrder: admin.adminOrder,
      orderByReference: admin.orderByReference,
      refundOrder: admin.refundOrder,
    } : {}),
    id: 'magento',
    // Customers and credit memos are admin data: only with the Integration.
    collections: admin ? ['products', 'orders', 'customers', 'creditmemos'] : ['products', 'orders'],
    isEnabled: () => true,
    async request({ collection, key }: DirectusRequestDescriptor) {
      if (admin && (collection === 'orders' || collection === 'customers' || collection === 'creditmemos') && key === undefined) {
        return admin.list(collection)
      }
      switch (collection) {
        case 'products': {
          const items = await fetchProducts(magento, key)
          return key ? (items[0] ?? null) : items
        }
        case 'orders':
          // Known gap: real Magento has no root-level orders/Order query —
          // order history only exists nested under an authenticated
          // customer (`customer { orders { items { ... } } }`), which needs
          // a per-request customer token this facade doesn't carry today.
          // Returns empty rather than throwing, so callers degrade
          // gracefully instead of the whole request failing.
          return key ? null : []
        default:
          throw new Error(`magento commerce-backend adapter: unmapped collection "${collection}"`)
      }
    },
    async getProductsByCategory(ref: CategoryProductsRef) {
      const categoryUid = await resolveCategoryUid(magento, ref)
      // No matching Magento category (e.g. a Directus-only department with
      // no Magento counterpart) — degrade to an empty list, never throw.
      if (!categoryUid) return []
      return fetchProductsByCategoryUid(magento, categoryUid)
    },
  }
}
