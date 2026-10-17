import type { BackendOrder, CategoryProductsRef, CommerceBackendAdapter, DirectusRequestDescriptor, PaidOrder } from 'alternate-sdk'
import type { MagentoAdapter, MagentoCustomerOrder, MagentoOAuth1Credentials } from '@mframework/adapter-magento'
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

/**
 * `credentials` (the Magento Integration, server-side only) enables
 * placePaidOrder: orders paid with the app's Stripe checkout are recorded
 * in Magento (Meeovi_MarketplaceApi ExternalOrderManagement), where Webkul
 * credits each seller's sale.
 */
export function createMagentoCommerceBackendAdapter(magento: MagentoAdapter, credentials?: MagentoOAuth1Credentials | null): CommerceBackendAdapter {
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

  // Order history lives in Magento; reading it needs the Integration too.
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
      }
    : {}

  return {
    ...(placePaidOrder ? { placePaidOrder } : {}),
    ...orders,
    id: 'magento',
    collections: ['products', 'orders'],
    isEnabled: () => true,
    async request({ collection, key }: DirectusRequestDescriptor) {
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
