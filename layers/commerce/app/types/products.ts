// layers/commerce/app/types/products.ts
import type { Ref } from 'vue'
import type {
  Address,
  FilterInput,
  ID,
  Maybe,
  MediaAsset,
  Money,
  PaginationParams,
  Paginated,
  SeoMetadata,
  StockStatus,
  Timestamps,
} from './common'

export type { Paginated, PaginationParams, FilterInput } from './common'

// ---------------------------------------------------------------------------
// Core product primitives
// ---------------------------------------------------------------------------

/** The eight product models supported by the commerce engine. */
export type ProductType =
  | 'simple'
  | 'configurable'
  | 'bundle'
  | 'grouped'
  | 'virtual' // digital / non-shippable
  | 'downloadable' // digital product with downloadable links
  | 'subscription'
  | 'giftcard'
  | 'event'

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived'

export type ProductVisibility = 'catalog' | 'search' | 'catalog_search' | 'not_visible'

export interface ProductPrice {
  current: number
  regular: number
  currencyCode: string
  formatted?: string
}

export interface PriceTier {
  qty: number
  value: number
  currencyCode: string
}

export interface ProductAttributeValue {
  attributeCode: string
  label: string
  value: string | number | boolean
}

export interface ProductMedia extends MediaAsset {}

/** A concrete, purchasable variation (used by configurable/subscription products). */
export interface ProductVariant {
  id: ID
  sku: string
  parentSku?: string
  name?: string
  price: Money
  regularPrice?: Money
  specialPrice?: Money
  options: Record<string, string> // attributeCode -> value
  stock: ProductStockInfo
  weight?: number
  image?: string
  status?: ProductStatus
}

export interface ConfigurableOption {
  attributeCode: string
  label: string
  position?: number
  values: Array<{
    value: string
    label: string
    swatch?: string
    swatchType?: 'visual' | 'text'
  }>
}

export interface BundleSelection {
  id: ID
  sku: string
  name: string
  price: Money
  priceType: 'fixed' | 'percent'
  isDefault?: boolean
  qty?: number
  canChangeQty?: boolean
}

export interface BundleItem {
  id: ID
  title: string
  position?: number
  required?: boolean
  type: 'radio' | 'checkbox' | 'select' | 'multi'
  selections: BundleSelection[]
}

export interface GroupedItem {
  id: ID
  sku: string
  name: string
  position?: number
  defaultQty: number
  qtyIncrements?: number
}

export interface DownloadableLink {
  id: ID
  title: string
  fileUrl?: string
  sampleUrl?: string
  price?: Money
  sortOrder?: number
  shareable?: boolean
  maxDownloads?: number
}

export interface SubscriptionPlan {
  id: ID
  interval: 'day' | 'week' | 'month' | 'year'
  intervalCount: number
  trialIntervalCount?: number
  trialInterval?: 'day' | 'week' | 'month' | 'year'
  billingCycles?: number
  initialFee?: Money
  discountPercent?: number
}

export interface GiftCardInfo {
  amount: Money
  isPhysical?: boolean
  allowCustomAmount?: boolean
  minAmount?: Money
  maxAmount?: Money
  expiryDays?: number
}

export interface EventInfo {
  startAt: string | Date
  endAt?: string | Date
  venue?: Address
  timezone?: string
  ticketTypes?: Array<{
    id: ID
    name: string
    price: Money
    qtyAvailable?: number
    qtySold?: number
  }>
  isOnline?: boolean
  streamUrl?: string
}

export interface ProductStockInfo {
  sku: string
  quantity: number
  salableQuantity?: number
  status: StockStatus
  manageStock?: boolean
  backorders?: boolean
  threshold?: number // low-stock threshold
}

// ---------------------------------------------------------------------------
// Base product + specialized product shapes
// ---------------------------------------------------------------------------

export interface ProductBase extends Timestamps {
  id: ID
  sku: string
  name: string
  slug: string
  type: ProductType
  description?: string
  shortDescription?: string
  status: ProductStatus
  visibility?: ProductVisibility
  price: ProductPrice
  currencyCode: string
  images: string[]
  mediaGallery?: ProductMedia[]
  attributes?: ProductAttributeValue[]
  attributeSetId?: ID
  categoryIds?: ID[]
  weight?: number
  taxClass?: string
  seo?: SeoMetadata
  rating?: number
  reviewsCount?: number
  stock: ProductStockInfo
  urlKey?: string
  urlPath?: string
  relatedIds?: ID[]
  crossSellIds?: ID[]
  upSellIds?: ID[]
  extensionAttributes?: Record<string, unknown>
}

export interface SimpleProduct extends ProductBase {
  type: 'simple'
}

export interface ConfigurableProduct extends ProductBase {
  type: 'configurable'
  configurableOptions: ConfigurableOption[]
  variants: ProductVariant[]
}

export interface BundleProduct extends ProductBase {
  type: 'bundle'
  priceType: 'dynamic' | 'fixed'
  bundleItems: BundleItem[]
  shipBundleItems?: boolean
}

export interface GroupedProduct extends ProductBase {
  type: 'grouped'
  groupedItems: GroupedItem[]
}

export interface VirtualProduct extends ProductBase {
  type: 'virtual'
}

export interface DownloadableProduct extends ProductBase {
  type: 'downloadable'
  links: DownloadableLink[]
  samples?: DownloadableLink[]
}

export interface SubscriptionProduct extends ProductBase {
  type: 'subscription'
  plan: SubscriptionPlan
  variants?: ProductVariant[]
}

export interface GiftCardProduct extends ProductBase {
  type: 'giftcard'
  giftCard: GiftCardInfo
}

export interface EventProduct extends ProductBase {
  type: 'event'
  event: EventInfo
}

export type Product =
  | SimpleProduct
  | ConfigurableProduct
  | BundleProduct
  | GroupedProduct
  | VirtualProduct
  | DownloadableProduct
  | SubscriptionProduct
  | GiftCardProduct
  | EventProduct

// ---------------------------------------------------------------------------
// Search / listing
// ---------------------------------------------------------------------------

export interface ProductSearchParams extends PaginationParams {
  categoryId?: ID
  search?: string
  sku?: string
  type?: ProductType
  status?: ProductStatus
  filter?: FilterInput
  sort?: string
  sortDirection?: 'asc' | 'desc'
  storeId?: ID
  currencyCode?: string
}

// Legacy aliases retained for backwards compatibility.
export interface SfProductStockItem {
  productId: ID
  sku: string
  quantity: number
  status?: number
}

export interface SfStockItem {
  sku: string
  quantity: number
  status?: number
}

export interface SfInventorySource {
  code: string
  name: string
  description?: string
  status?: number
}

// ---------------------------------------------------------------------------
// Provider interface contract (consumed by composables)
// ---------------------------------------------------------------------------

export interface CommerceProductClient {
  /** Fetch a paginated and filtered list of products */
  getProducts(params?: ProductSearchParams): Promise<Paginated<Product>>

  /** Fetch a single product details by its unique SKU */
  getProductBySku(sku: string): Promise<Maybe<Product>>

  /** Fetch a single product details by its unique ID */
  getProductById(id: string): Promise<Maybe<Product>>

  /** Fetch a single product details by its URL slug */
  getProductBySlug(slug: string): Promise<Maybe<Product>>

  /** Fetch the entire category tree or specific root categories */
  getCategories(parentId?: Maybe<ID>): Promise<import('./categories').Category[]>

  /** Fetch a single category profile by its slug/identifier */
  getCategoryBySlug(slug: string): Promise<Maybe<import('./categories').Category>>
}

export type FetchProducts = (params?: ProductSearchParams) => Promise<Ref<Paginated<Product>>>
export type FetchProductsByIds = (ids: ID[]) => Promise<Ref<Product[]>>
export type GetProducts = () => Promise<Product[]>
export interface UseProductsState {
  data: Maybe<Paginated<Product>>
  loading: boolean
}
export interface UseProducts {
  data: Readonly<Ref<UseProductsState['data']>>
  loading: Readonly<Ref<boolean>>
  fetchProducts: FetchProducts
  fetchProductsByIds: FetchProductsByIds
}
export type UseProductsReturn = () => UseProducts

export interface UseProductRecommendedState {
  data: Maybe<Product[]>
  loading: boolean
}
export type FetchProductRecommended = (slug: string) => Promise<Ref<Maybe<Product[]>>>
export interface UseProductRecommended {
  data: Readonly<Ref<UseProductRecommendedState['data']>>
  loading: Readonly<Ref<boolean>>
  fetchRecommended: FetchProductRecommended
}
export type UseProductRecommendedReturn = (slug: string) => UseProductRecommended

export interface ProductProvider {
  getProducts(params?: ProductSearchParams): Promise<Paginated<Product>>
  getProductBySku(sku: string): Promise<Maybe<Product>>
  getProductById(id: ID): Promise<Maybe<Product>>
  getProductBySlug(slug: string): Promise<Maybe<Product>>
  searchProducts(params?: ProductSearchParams): Promise<Paginated<Product>>
}

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

export interface Subscription {
  id: ID
  productId?: ID
  sku?: string
  customerId?: ID
  status: 'active' | 'paused' | 'canceled' | 'expired' | 'pending'
  plan?: SubscriptionPlan
  startedAt?: string | Date
  endedAt?: string | Date
  nextBillingAt?: string | Date
  quantity?: number
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface SubscriptionPayload {
  productId: ID
  customerId: ID
  sku?: string
  planId?: ID
  quantity?: number
}

export interface SubscriptionResponse {
  success: boolean
  subscription?: Subscription
}
