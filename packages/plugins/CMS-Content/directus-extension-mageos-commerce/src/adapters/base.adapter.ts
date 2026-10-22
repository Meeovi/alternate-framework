import type {
  AdminCollection, BackendAdminOrder, BackendField, BackendGiftCard, BackendOrder, BackendRefund, BackendSeller,
  CreatedCustomer, CustomerInput, NormalizedCategory, NormalizedProduct, OrderFilter, Paginated, PaidOrder,
  PlacedOrder, ProductQueryOptions, ProductReview, ReviewInput, ReviewRatingMetadata, SearchOptions, SearchResult,
  SellerProductInput, ShipmentInput, StoreConfig, SyncImageInput, SyncProductInput, SyncStockInput,
} from '../types'

/**
 * What every commerce backend implements. The endpoint (src/index.ts) only
 * talks to this interface, so swapping Mage-OS for another backend means
 * adding an adapter and changing createAdapter() — not the /commerce/* API.
 *
 * The catalog methods are required. The groups below them are optional
 * capabilities: a backend without one answers its routes with 501.
 *
 * Adapters throw CommerceError (src/errors.ts) for upstream failures so the
 * endpoint can answer with a consistent status and serve cached data.
 */
export interface ICommerceAdapter {
  /** A short id for logs and cache keys, e.g. "mage-os". */
  readonly id: string

  getProducts(params: ProductQueryOptions): Promise<NormalizedProduct[]>

  /**
   * getProducts() plus the totals the endpoint needs for pagination. Kept
   * as its own method so getProducts() stays a plain list.
   */
  getProductPage(params: ProductQueryOptions): Promise<Paginated<NormalizedProduct>>

  getProductBySlug(slug: string): Promise<NormalizedProduct | null>

  /** The category tree below the store's root category. */
  getCategories(): Promise<NormalizedCategory[]>

  /** Live stock quantity per SKU; SKUs the backend doesn't know are omitted. */
  getInventory(skus: string[]): Promise<Record<string, number>>

  /** Full-text search with optional facets. */
  search?(options: SearchOptions): Promise<SearchResult>
  /** Product-name suggestions for a partial query. */
  suggest?(query: string): Promise<string[]>
  getStoreConfig?(): Promise<StoreConfig>
  /** A category id for a category slug (url key), or null. */
  resolveCategoryId?(slug: string): Promise<string | null>

  reviews?: {
    list(sku: string, pageSize: number): Promise<ProductReview[]>
    ratings(): Promise<ReviewRatingMetadata[]>
    create(sku: string, input: ReviewInput): Promise<ProductReview>
  }

  customers?: {
    /** A backend customer record for a user authenticated elsewhere (e.g. better-auth). */
    create(input: CustomerInput): Promise<CreatedCustomer>
  }

  orders?: {
    /** Record an order already paid outside the backend; idempotent on `reference`. */
    placePaid(order: PaidOrder): Promise<PlacedOrder>
    forCustomer(customerId: string, page: number, pageSize: number): Promise<BackendOrder[]>
    /** null when the order doesn't exist or isn't this customer's. */
    oneForCustomer(customerId: string, orderId: string): Promise<BackendOrder | null>
    purchasedSkus(customerId: string): Promise<string[]>
  }

  giftCards?: {
    products(): Promise<NormalizedProduct[]>
    received(email: string): Promise<BackendGiftCard[]>
    purchased(customerId: string): Promise<BackendGiftCard[]>
  }

  /** Marketplace sellers (the seller of each SKU, and sellers' own shops). */
  sellers?: {
    forSkus(skus: string[]): Promise<Record<string, BackendSeller>>
    /** Self-scoped: `customerToken` must belong to `customerId`. */
    register(customerId: string, customerToken: string, shopUrl?: string): Promise<{ sellerRecordId: number, isApproved: boolean, shopUrl: string }>
    /** Self-scoped like register(). */
    createProduct(customerId: string, customerToken: string, input: SellerProductInput): Promise<{ productId: number, sku: string, marketplaceProductId: number }>
    shop(customerId: string): Promise<Record<string, unknown> | null>
    updateShop(customerId: string, updates: Record<string, unknown>): Promise<Record<string, unknown> | null>
    products(customerId: string): Promise<unknown[]>
    orders(customerId: string): Promise<unknown[]>
    transactions(customerId: string): Promise<unknown[]>
    lowStock(customerId: string): Promise<unknown[]>
  }

  /** Server jobs that keep a seller's catalogue in sync (e.g. dropshipping). */
  catalogSync?: {
    upsertProduct(input: SyncProductInput): Promise<{ product_id: number, sku: string, marketplace_product_id: number | null }>
    updateStock(input: SyncStockInput): Promise<boolean>
    addImage(input: SyncImageInput): Promise<boolean>
    listOrders(filters: OrderFilter[], pageSize: number): Promise<{ items: unknown[], total_count: number }>
    shipOrder(orderId: string, shipment: ShipmentInput): Promise<number>
  }

  /** Store administration: flat rows for tables, plus order lookup and refunds. */
  admin?: {
    list(collection: AdminCollection): Promise<Record<string, unknown>[]>
    schema(collection: AdminCollection): BackendField[]
    createCustomer(data: Record<string, unknown>): Promise<Record<string, unknown>>
    updateCustomer(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>>
    deleteCustomer(id: string): Promise<void>
    order(orderId: string): Promise<BackendAdminOrder | null>
    orderByReference(reference: string): Promise<BackendAdminOrder | null>
    refund(refund: BackendRefund): Promise<{ creditMemoId: string }>
  }
}
