/**
 * The normalized commerce contract exposed at /commerce/*. Nothing here is
 * Magento-specific: any adapter (src/adapters) maps its backend onto these
 * shapes, so the frontend never changes when the backend does.
 */

export interface NormalizedProduct {
  id: string
  sku: string
  name: string
  slug: string
  price: {
    regular: number
    final: number
    currency: string
  }
  inStock: boolean
  images: string[]
  categories: { id: string, name: string, slug: string }[]
  attributes: Record<string, any>
  updatedAt: string
}

export interface NormalizedCategory {
  id: string
  name: string
  slug: string
  /** Full path of slugs from the root, e.g. "women/tops-women/jackets-women". */
  path: string
  /** Depth below the store's root category (top-level categories are 1). */
  level: number
  position: number
  productCount: number
  includeInMenu: boolean
  children: NormalizedCategory[]
}

export type ProductSort = 'relevance' | 'position' | 'name' | '-name' | 'price' | '-price'

export interface ProductQueryOptions {
  /** 1-based. */
  page?: number
  pageSize?: number
  search?: string
  /** Category id (as returned in NormalizedCategory.id). */
  categoryId?: string
  /** Category path (NormalizedCategory.path), an alternative to categoryId. */
  categoryPath?: string
  skus?: string[]
  priceMin?: number
  priceMax?: number
  sort?: ProductSort
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// ---------------------------------------------------------------------------
// Beyond the catalog. These mirror alternate-sdk's commerce-backend contract
// (BackendOrder, BackendAdminOrder, BackendGiftCard, …) field for field, so
// the app consumes /commerce/* responses with the types it already uses.
// Money in orders is in minor units (cents), as in that contract.
// ---------------------------------------------------------------------------

export interface SearchOptions {
  query: string
  page?: number
  pageSize?: number
  categoryId?: string
  sort?: ProductSort
  /** Layered-navigation facets for the result set. */
  facets?: boolean
}

export interface SearchFacet {
  code: string
  label: string
  options: { label: string, value: string, count: number }[]
}

export interface SearchResult extends Paginated<NormalizedProduct> {
  facets: SearchFacet[]
}

export interface StoreConfig {
  storeCode: string
  storeName: string
  baseCurrency: string
  displayCurrency: string
  locale: string
  mediaUrl: string
  copyright: string | null
  reviewsEnabled: boolean
  guestReviewsAllowed: boolean
}

export interface ProductReview {
  nickname: string
  summary: string
  text: string
  createdAt: string
  /** 0–100, as Magento reports it. */
  averageRating: number
  ratings: { name: string, value: string }[]
}

export interface ReviewRatingMetadata {
  id: string
  name: string
  values: { id: string, value: string }[]
}

export interface ReviewInput {
  nickname: string
  summary: string
  text: string
  /** Rating ids/value ids from GET /commerce/reviews/ratings. */
  ratings: { id: string, valueId: string }[]
}

export interface CustomerInput {
  firstname: string
  lastname: string
  email: string
  /** Also register the new customer as a marketplace seller. */
  wantsToSell?: boolean
}

export interface CreatedCustomer {
  id: string | null
  email: string
  firstname: string
  lastname: string
  /** Set when wantsToSell was requested and registration succeeded. */
  seller: { isApproved: boolean, shopUrl: string } | null
}

export type PaidOrder = {
  reference: string
  customerId: string
  items: { key: string, qty: number }[]
  amountPaid: number
  currency: string
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

export type PlacedOrder = { id: string, number: string, created: boolean }

export type BackendOrder = {
  id: string
  number: string
  date_created: string
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

export type BackendAdminOrder = BackendOrder & {
  reference: string | null
  customer_id: string | null
  refundable: { key: string, name: string, qty: number, unit_amount: number }[]
}

export type BackendRefund = {
  orderId: string
  items?: { key: string, qty: number }[]
  comment?: string
}

export type BackendGiftCard = {
  code: string | null
  state: string
  enabled: boolean
  balance: number | null
  created_at: string | null
  expires_at: string | null
  recipient_name: string | null
  recipient_email: string | null
  sender_name: string | null
  sender_email: string | null
  product_name: string | null
  product_sku: string | null
  order_number: string | null
  message: string | null
}

export type BackendSeller = { customerId: string, name: string | null, shopUrl: string | null }

export type BackendField = {
  field: string
  label: string
  type: 'string' | 'text' | 'number' | 'boolean' | 'datetime' | 'json'
  readonly?: boolean
  required?: boolean
  primary?: boolean
  hidden?: boolean
  choices?: Array<{ id: string | number, label: string }>
}

export type AdminCollection = 'customers' | 'orders' | 'creditmemos'

export interface SellerProductInput {
  sku: string
  name: string
  price: number
  description?: string
  shortDescription?: string
  qty?: number
  weight?: number
  attributeSetId?: number
  websiteIds?: number[]
  categoryIds?: number[]
}

export interface SyncProductInput {
  customerId: number
  sku: string
  name: string
  price: number
  description?: string
  shortDescription?: string
  qty?: number
  weight?: number | null
  categoryIds?: number[]
  enabled?: boolean
}

export interface SyncStockInput { customerId: number, sku: string, qty: number, price?: number | null, enabled?: boolean | null }

export interface SyncImageInput {
  customerId: number
  sku: string
  base64Content: string
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif'
  fileName: string
  isMain?: boolean
}

export interface ShipmentInput {
  items: { order_item_id: number, qty: number }[]
  tracks: { track_number: string, title: string, carrier_code: string }[]
  notify?: boolean
}

export type OrderFilter = { field: string, value: string, condition?: string }
