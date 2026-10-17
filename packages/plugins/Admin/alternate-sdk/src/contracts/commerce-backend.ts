// Note: this is a distinct registry from CommerceDriverRegistry (commerce.ts).
// CommerceDriverRegistry's CommerceDriverContract is a generic, normalized
// commerce interface (getProduct(): Promise<Product|null>, etc.) with zero
// registered implementations anywhere in the repo. CommerceBackendRegistry
// exists to solve a narrower, concrete problem: layers/commerce's pages and
// components are hardcoded against Directus's REST/query shape (collection
// name + Directus-style filter/fields params), and adapters that want to
// back those same call sites need to speak that exact shape, not a generic
// product model.
export type DirectusRequestDescriptor = {
  method: 'GET'
  collection: string
  key?: string | number
  params?: Record<string, any>
}

export type CategoryProductsRef = {
  /** Directus department/category slug — always provided, the default lookup key. */
  slug: string
  /** Backend-native category id already stored on the Directus record
   *  (departments.relative_id / categories.uid), when populated. Adapters
   *  MUST prefer this over resolving by slug when present — skips a lookup
   *  round trip and isn't subject to slug drift between the CMS and the
   *  backend catalog. */
  externalId?: string
}

/**
 * An order whose payment was taken outside the backend (the app's Stripe
 * checkout), to be recorded in it — so orders, and any marketplace
 * seller's sale, live in the commerce backend.
 */
export type PaidOrder = {
  /** The payment's own id (e.g. the Stripe payment intent). Backends must
   *  be idempotent on it: a repeat call returns the same order. */
  reference: string
  /** The buyer's customer id in this backend. */
  customerId: string
  /** Lines, by this adapter's product key (`request({ collection: 'products', key })`). */
  items: { key: string, qty: number }[]
  /** What the buyer paid for these lines, in `currency`. */
  amountPaid: number
  currency: string
  /** Used when the backend has no billing address for the customer. */
  billingAddress?: {
    firstname?: string
    lastname?: string
    street?: string[]
    city?: string
    region_code?: string
    postcode?: string
    country_id?: string
    telephone?: string
  }
}

/**
 * An order as the app's order pages show it — the same shape the app's
 * own (Directus) orders have, so pages don't care which backend it came
 * from. Totals are integer minor units (cents, like Stripe); line item
 * amounts are major units.
 */
export type BackendOrder = {
  /** The backend's own order id (the app routes it as `<backend>:<id>`). */
  id: string
  /** The order number shown to the customer. */
  number: string
  date_created: string
  /** pending | completed | refunded | cancelled | on-hold | failed */
  payment_status: string
  fulfillment_status?: string | null
  order_currency_code: string
  grand_total: number
  subtotal: number
  tax_amount: number
  shipping_amount: number
  total_paid: number
  total_refunded: number
  total_due: number
  customer_firstname?: string | null
  customer_lastname?: string | null
  customer_email?: string | null
  line_items_snapshot: { product_id: string | null, name: string, quantity: number, unit_amount: number, subtotal: number }[]
  tracking_number?: string | null
  tracking_url?: string | null
  shipment_carrier?: string | null
}

/** Who sells a product in a marketplace backend (e.g. a Webkul seller). */
export type BackendSeller = {
  /** The seller's customer id in the backend (what the app links users by). */
  customerId: string
  /** Shop name, when the seller set one. */
  name: string | null
}

export interface CommerceBackendAdapter {
  readonly id: string
  readonly collections: string[]
  isEnabled(): boolean
  /** Must return Directus-shaped data, already unwrapped (no {data:...} envelope). */
  request(descriptor: DirectusRequestDescriptor): Promise<any>
  /**
   * Products belonging to the department/category identified by `ref`,
   * normalized to this adapter's Directus-shaped product output. Optional
   * and deliberately separate from `request()`'s generic collection
   * passthrough: "departments" is a Directus-only CMS concept no other
   * backend needs to understand — this takes an explicit category
   * reference instead of a Directus collection name. Adapters with no
   * category concept simply omit it; callers must feature-detect with
   * `typeof adapter.getProductsByCategory === 'function'`.
   */
  getProductsByCategory?(ref: CategoryProductsRef): Promise<any[]>
  /**
   * Record an order the app already took payment for (see PaidOrder).
   * Optional: feature-detect with `typeof adapter.placePaidOrder === 'function'`.
   */
  placePaidOrder?(order: PaidOrder): Promise<{ id: string, number: string, created: boolean }>
  /**
   * A customer's order history in this backend, newest first. Optional:
   * feature-detect with `typeof adapter.customerOrders === 'function'`.
   */
  customerOrders?(customerId: string, options?: { page?: number, pageSize?: number }): Promise<BackendOrder[]>
  /** One of the customer's orders; null when it isn't theirs or doesn't exist. */
  customerOrder?(customerId: string, orderId: string): Promise<BackendOrder | null>
  /**
   * The seller of each product, keyed by product key; products with no
   * seller are left out. Optional (marketplace backends only).
   */
  productSellers?(keys: string[]): Promise<Record<string, BackendSeller>>
}

const registry = new Map<string, CommerceBackendAdapter>()

export function registerCommerceBackendAdapter(adapter: CommerceBackendAdapter): void {
  registry.set(adapter.id, adapter)
}

export function getCommerceBackendAdapter(name?: string): CommerceBackendAdapter | undefined {
  return name ? registry.get(name) : undefined
}

/** Every registered adapter, in registration order (e.g. to discover which
 *  installed adapter-* packages can serve a collection). */
export function listCommerceBackendAdapters(): CommerceBackendAdapter[] {
  return [...registry.values()]
}

export const CommerceBackendRegistry = {
  register: registerCommerceBackendAdapter,
  get: getCommerceBackendAdapter,
  list: listCommerceBackendAdapters,
}
