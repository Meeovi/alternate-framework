import type { RestCommand } from '@directus/sdk'
import type {
  AdminCollection, BackendAdminOrder, BackendField, BackendGiftCard, BackendOrder, BackendRefund, BackendSeller,
  CreatedCustomer, CustomerInput, NormalizedCategory, NormalizedProduct, OrderFilter, Paginated, PaidOrder, PlacedOrder,
  ProductReview, ProductSort, ReviewInput, ReviewRatingMetadata, SearchResult, SellerProductInput, ShipmentInput,
  StoreConfig, SyncDownloadInput, SyncImageInput, SyncProductInput, SyncStockInput, TaxQuote, TaxQuoteInput,
} from '../src/types'

/**
 * Typed Directus SDK commands for the /commerce/* endpoint extension:
 *
 *   import { createDirectus, rest, staticToken } from '@directus/sdk'
 *   import { commerce } from '@mframework/mageos-commerce-sdk'
 *
 *   const directus = createDirectus(url).with(rest())
 *   const page = await directus.request(commerce.products({ category_slug: 'books', sort: 'price', limit: 24 }))
 *   page.items, page.total
 *
 * Routes under "trusted" need a client authenticated as a Directus admin or
 * a MAGEOS_TRUSTED_USERS user — call them server-side only, e.g.
 * createDirectus(url).with(staticToken(token)).with(rest()).
 */

export type * from '../src/types'

export interface ProductListParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  category_path?: string
  category_slug?: string
  sku?: string[]
  price_min?: number
  price_max?: number
  sort?: ProductSort
}

export interface SearchParams {
  q: string
  page?: number
  limit?: number
  category?: string
  sort?: ProductSort
  facets?: boolean
}

/**
 * The SDK's own customEndpoint is just `() => options`; defined here so this
 * package needs @directus/sdk for types only. An app bundling it never gets
 * a second copy of the SDK (the extension's own node_modules has one).
 */
type CommandOptions = { path: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', params?: Record<string, string>, body?: string }
const customEndpoint = <Output>(options: CommandOptions): RestCommand<Output, never> => () => options

const BASE = '/commerce'
const seg = (value: string | number) => encodeURIComponent(String(value))

/** Drops undefined values and joins lists, so only real params reach the URL. */
function query(params: object = {}): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    out[key] = Array.isArray(value) ? value.join(',') : String(value)
  }
  return out
}

const get = <T>(path: string, params?: object) =>
  customEndpoint<T>({ path: `${BASE}${path}`, method: 'GET', params: query(params) })
const send = <T>(method: 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown) =>
  customEndpoint<T>({ path: `${BASE}${path}`, method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })

export const commerce = {
  // ---- Public storefront --------------------------------------------------
  products: (params?: ProductListParams) => get<Paginated<NormalizedProduct>>('/products', params),
  product: (slug: string) => get<NormalizedProduct>(`/products/${seg(slug)}`),
  productReviews: (slug: string, params?: { limit?: number }) => get<ProductReview[]>(`/products/${seg(slug)}/reviews`, params),
  createReview: (slug: string, review: ReviewInput) => send<ProductReview>('POST', `/products/${seg(slug)}/reviews`, review),
  reviewRatings: () => get<ReviewRatingMetadata[]>('/reviews/ratings'),
  categories: () => get<NormalizedCategory[]>('/categories'),
  /** By id, or by path (e.g. "women/tops-women"). */
  category: (idOrPath: string) => get<NormalizedCategory>(`/categories/${seg(idOrPath)}`),
  search: (params: SearchParams) => get<SearchResult>('/search', params),
  suggest: (q: string) => get<string[]>('/search/suggest', { q }),
  store: () => get<StoreConfig>('/store'),
  giftCardProducts: () => get<NormalizedProduct[]>('/gift-cards/products'),
  /** The marketplace seller of each SKU; store-owned SKUs are absent. */
  sellers: (skus: string[]) => get<Record<string, BackendSeller>>('/sellers', { sku: skus }),
  /** Live quantities; null = SKU unknown. */
  stock: (skus: string[]) => send<Record<string, number | null>>('POST', '/realtime/stock', { skus }),

  // ---- Trusted: customers, orders, gift cards ------------------------------
  createCustomer: (input: CustomerInput) => send<CreatedCustomer>('POST', '/customers', input),
  customerOrders: (customerId: string, params?: { page?: number, limit?: number }) => get<BackendOrder[]>(`/customers/${seg(customerId)}/orders`, params),
  customerOrder: (customerId: string, orderId: string) => get<BackendOrder>(`/customers/${seg(customerId)}/orders/${seg(orderId)}`),
  purchasedSkus: (customerId: string) => get<string[]>(`/customers/${seg(customerId)}/purchased-skus`),
  customerGiftCards: (customerId: string) => get<BackendGiftCard[]>(`/customers/${seg(customerId)}/gift-cards`),
  receivedGiftCards: (email: string) => get<BackendGiftCard[]>('/gift-cards/received', { email }),
  /** Idempotent on `reference`: a repeat returns the same order with created: false. */
  placePaidOrder: (order: PaidOrder) => send<PlacedOrder>('POST', '/orders', order),
  /** Tax for a checkout before payment, from the store's own tax rules. */
  quoteTax: (input: TaxQuoteInput) => send<TaxQuote>('POST', '/tax/quote', input),

  // ---- Trusted: marketplace sellers -----------------------------------------
  registerSeller: (input: { customerId: string, customerToken: string, shopUrl?: string }) =>
    send<{ sellerRecordId: number, isApproved: boolean, shopUrl: string }>('POST', '/sellers/register', input),
  createSellerProduct: (customerId: string, customerToken: string, product: SellerProductInput) =>
    send<{ productId: number, sku: string, marketplaceProductId: number }>('POST', `/sellers/${seg(customerId)}/products`, { customerToken, ...product }),
  sellerShop: (customerId: string) => get<Record<string, unknown>>(`/sellers/${seg(customerId)}/shop`),
  updateSellerShop: (customerId: string, updates: Record<string, unknown>) => send<Record<string, unknown>>('PATCH', `/sellers/${seg(customerId)}/shop`, updates),
  sellerProducts: (customerId: string) => get<unknown[]>(`/sellers/${seg(customerId)}/products`),
  sellerOrders: (customerId: string) => get<unknown[]>(`/sellers/${seg(customerId)}/orders`),
  sellerTransactions: (customerId: string) => get<unknown[]>(`/sellers/${seg(customerId)}/transactions`),
  sellerLowStock: (customerId: string) => get<unknown[]>(`/sellers/${seg(customerId)}/low-stock`),

  // ---- Trusted: catalogue sync (e.g. dropshipping) ---------------------------
  syncProduct: (input: SyncProductInput) => send<{ product_id: number, sku: string, marketplace_product_id: number | null }>('POST', '/sync/products', input),
  syncStock: (input: SyncStockInput) => send<boolean>('POST', '/sync/stock', input),
  syncImage: (input: SyncImageInput) => send<boolean>('POST', '/sync/images', input),
  /** Make a seller product a downloadable with this one file; `shareable` + price 0 = free download. */
  syncDownload: (input: SyncDownloadInput) => send<boolean>('POST', '/sync/download', input),
  syncOrders: (filters: OrderFilter[] = [], limit?: number) => get<{ items: unknown[], total_count: number }>('/sync/orders', { filters: JSON.stringify(filters), limit }),
  shipOrder: (orderId: string, shipment: ShipmentInput) => send<{ shipmentId: string }>('POST', `/sync/orders/${seg(orderId)}/ship`, shipment),

  // ---- Trusted: store admin --------------------------------------------------
  adminList: (collection: AdminCollection) => get<Record<string, unknown>[]>(`/admin/${collection}`),
  adminSchema: (collection: AdminCollection) => get<BackendField[]>(`/admin/${collection}/schema`),
  adminCreateCustomer: (data: Record<string, unknown>) => send<Record<string, unknown>>('POST', '/admin/customers', data),
  adminUpdateCustomer: (id: string, data: Record<string, unknown>) => send<Record<string, unknown>>('PATCH', `/admin/customers/${seg(id)}`, data),
  adminDeleteCustomer: (id: string) => send<null>('DELETE', `/admin/customers/${seg(id)}`),
  adminOrder: (orderId: string) => get<BackendAdminOrder>(`/admin/orders/${seg(orderId)}`),
  adminOrderByReference: (reference: string) => get<BackendAdminOrder>(`/admin/orders/by-reference/${seg(reference)}`),
  refundOrder: (refund: BackendRefund) => send<{ creditMemoId: string }>('POST', `/admin/orders/${seg(refund.orderId)}/refund`, { items: refund.items, comment: refund.comment }),
}
