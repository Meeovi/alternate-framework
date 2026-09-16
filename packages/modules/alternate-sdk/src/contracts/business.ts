// Seller/business-dashboard domain: products, orders, invoices, reviews,
// shipments, spaces, attributes and integrations owned by (or scoped to)
// the signed-in seller, plus an aggregate stats read for the insights page.
//
// shop/lowStock/transactions/payouts/coupons/featuredProducts/announcements
// below map onto Webkul Multi Vendor Marketplace's real seller-panel
// feature set (Meeovi_MarketplaceApi bridges to a genuine, live Webkul
// install — see packages/adapters/adapter-magento/magento-module). They're
// additive alongside the pre-existing entities above, not a replacement —
// products/orders/invoices/reviews/shipments/spaces/attributes/integrations
// stay as they are.
//
// Mirrors the shape of contracts/social.ts — a set of typed row models, a
// contract interface, and a small registry so a concrete backend (Magento/
// Webkul marketplace, Directus once it grows a `seller_id` field, etc.) can
// register itself without the frontend depending on any specific backend.

export interface SellerListParams {
  /** Injected server-side from the authenticated session — never trust a client-supplied value. */
  sellerId?: string
  limit?: number
  offset?: number
  [key: string]: unknown
}

export interface SellerProduct {
  id: string | number
  name: string
  sku: string
  category: string
  price: number
  stock: number
  status: 'active' | 'draft' | 'archived'
  updated: string
}

export interface SellerOrder {
  id: string
  customer: string
  items: number
  total: number
  paymentStatus: 'paid' | 'pending' | 'refunded'
  fulfillmentStatus: 'unfulfilled' | 'processing' | 'shipped' | 'delivered'
  placed: string
}

export interface SellerInvoice {
  id: string
  order: string
  amount: number
  issuedDate: string
  dueDate: string
  status: 'paid' | 'pending' | 'overdue' | 'void'
}

export interface SellerReview {
  id: string | number
  product: string
  customer: string
  rating: number
  comment: string
  status: 'published' | 'pending' | 'flagged'
  date: string
}

export interface SellerShipment {
  id: string | number
  order: string
  carrier: string
  trackingNumber: string
  status: 'label_created' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception'
  shipped: string
}

export interface SellerSpace {
  id: string | number
  name: string
  description: string
  members: number
  posts: number
  visibility: 'public' | 'private' | 'invite_only'
  created: string
}

export interface SellerAttribute {
  id: string | number
  name: string
  code: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect'
  values: string
  usedBy: number
}

export interface SellerIntegration {
  id: string | number
  name: string
  provider: string
  category: string
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  connected: string | null
}

// --- Webkul Multi Vendor Marketplace seller-panel features -------------

export interface SellerShopProfile {
  shopName: string
  shopUrl: string
  bannerUrl: string | null
  logoUrl: string | null
  metaDescription: string
  shippingPolicy: string
  returnPolicy: string
  socialLinks: { facebook?: string; twitter?: string; instagram?: string }
  isApproved: boolean
}

export interface SellerLowStockItem {
  id: string | number
  name: string
  sku: string
  stock: number
  threshold: number
}

export interface SellerTransaction {
  id: string | number
  order: string
  product: string
  saleAmount: number
  commissionRate: number
  commissionAmount: number
  netEarning: number
  date: string
}

export interface SellerPayout {
  id: string | number
  amount: number
  method: 'paypal' | 'bank_transfer' | 'store_credit'
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  requestedDate: string
  paidDate: string | null
}

export interface SellerCoupon {
  id: string | number
  code: string
  discountType: 'percent' | 'fixed'
  discountValue: number
  usageLimit: number
  usedCount: number
  status: 'active' | 'expired' | 'scheduled'
  validFrom: string
  validTo: string
}

export interface SellerFeaturedProduct {
  id: string | number
  product: string
  slot: 'homepage' | 'category' | 'search'
  cost: number
  startDate: string
  endDate: string
  status: 'active' | 'pending' | 'expired'
}

export interface SellerAnnouncement {
  id: string | number
  title: string
  message: string
  from: string
  date: string
  read: boolean
}

export interface BusinessStats {
  orders: { total: number; unfulfilled: number; totalRevenue: number }
  products: { total: number; active: number; outOfStock: number }
  reviews: { total: number; averageRating: number; pending: number }
  recentOrders: SellerOrder[]
  spaces: { total: number; totalMembers: number; totalPosts: number }
  shipments: { inTransit: number; delivered: number; exceptions: number }
}

export interface SellerProductsDriver {
  list(params?: SellerListParams): Promise<SellerProduct[]>
}

export interface SellerOrdersDriver {
  list(params?: SellerListParams): Promise<SellerOrder[]>
}

export interface SellerInvoicesDriver {
  list(params?: SellerListParams): Promise<SellerInvoice[]>
}

export interface SellerReviewsDriver {
  list(params?: SellerListParams): Promise<SellerReview[]>
}

export interface SellerShipmentsDriver {
  list(params?: SellerListParams): Promise<SellerShipment[]>
}

export interface SellerSpacesDriver {
  list(params?: SellerListParams): Promise<SellerSpace[]>
}

export interface SellerAttributesDriver {
  list(params?: SellerListParams): Promise<SellerAttribute[]>
}

export interface SellerIntegrationsDriver {
  list(params?: SellerListParams): Promise<SellerIntegration[]>
}

export interface SellerShopDriver {
  get(params?: SellerListParams): Promise<SellerShopProfile>
  update(params: SellerListParams & Partial<SellerShopProfile>): Promise<SellerShopProfile>
}

export interface SellerLowStockDriver {
  list(params?: SellerListParams): Promise<SellerLowStockItem[]>
}

export interface SellerTransactionsDriver {
  list(params?: SellerListParams): Promise<SellerTransaction[]>
}

export interface SellerPayoutsDriver {
  list(params?: SellerListParams): Promise<SellerPayout[]>
  request(params: SellerListParams & { amount: number; method: SellerPayout['method'] }): Promise<SellerPayout>
}

export interface SellerCouponsDriver {
  list(params?: SellerListParams): Promise<SellerCoupon[]>
}

export interface SellerFeaturedProductsDriver {
  list(params?: SellerListParams): Promise<SellerFeaturedProduct[]>
}

export interface SellerAnnouncementsDriver {
  list(params?: SellerListParams): Promise<SellerAnnouncement[]>
}

export interface BusinessDriverContract {
  products: SellerProductsDriver
  orders: SellerOrdersDriver
  invoices: SellerInvoicesDriver
  reviews: SellerReviewsDriver
  shipments: SellerShipmentsDriver
  spaces: SellerSpacesDriver
  attributes: SellerAttributesDriver
  integrations: SellerIntegrationsDriver
  // Webkul Multi Vendor Marketplace seller-panel features (see the file
  // header comment) — additive, registered alongside the entities above.
  shop: SellerShopDriver
  lowStock: SellerLowStockDriver
  transactions: SellerTransactionsDriver
  payouts: SellerPayoutsDriver
  coupons: SellerCouponsDriver
  featuredProducts: SellerFeaturedProductsDriver
  announcements: SellerAnnouncementsDriver
  getStats(params?: SellerListParams): Promise<BusinessStats>
}

const businessRegistry = new Map<string, BusinessDriverContract>()
let defaultBusinessDriver: BusinessDriverContract | undefined

export function registerBusinessDriver(name: string, driver: BusinessDriverContract): void {
  businessRegistry.set(name, driver)
}

export function getBusinessDriver(name?: string): BusinessDriverContract | undefined {
  if (name) return businessRegistry.get(name)
  return defaultBusinessDriver
}

export function setDefaultBusinessDriver(driver: BusinessDriverContract): void {
  defaultBusinessDriver = driver
}

export const BusinessDriverRegistry = {
  register: registerBusinessDriver,
  get: getBusinessDriver,
  getDefaultDriver: () => defaultBusinessDriver,
  setDefaultDriver: setDefaultBusinessDriver,
}
