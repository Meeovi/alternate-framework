import type {
  BusinessDriverContract,
  BusinessStats,
  SellerAnnouncement,
  SellerAttribute,
  SellerCoupon,
  SellerFeaturedProduct,
  SellerIntegration,
  SellerInvoice,
  SellerListParams,
  SellerLowStockItem,
  SellerOrder,
  SellerPayout,
  SellerProduct,
  SellerReview,
  SellerShipment,
  SellerShopProfile,
  SellerSpace,
  SellerTransaction
} from 'alternate-sdk/contracts'

function paginate<T>(rows: T[], params?: SellerListParams): T[] {
  const offset = params?.offset ?? 0
  const limit = params?.limit
  const sliced = offset ? rows.slice(offset) : rows
  return typeof limit === 'number' ? sliced.slice(0, limit) : sliced
}

const PRODUCTS: SellerProduct[] = [
  { id: 1, name: 'Wireless Earbuds Pro', sku: 'WEB-001', category: 'Electronics', price: 79.99, stock: 142, status: 'active', updated: '2026-09-10' },
  { id: 2, name: 'Organic Cotton Tee', sku: 'OCT-014', category: 'Apparel', price: 24.5, stock: 58, status: 'active', updated: '2026-09-08' },
  { id: 3, name: 'Ceramic Coffee Mug', sku: 'CCM-220', category: 'Home', price: 14.0, stock: 0, status: 'archived', updated: '2026-08-30' },
  { id: 4, name: 'Adjustable Standing Desk', sku: 'ASD-005', category: 'Furniture', price: 349.0, stock: 12, status: 'active', updated: '2026-09-12' },
  { id: 5, name: 'Bluetooth Keyboard', sku: 'BTK-330', category: 'Electronics', price: 45.99, stock: 27, status: 'draft', updated: '2026-09-05' },
  { id: 6, name: 'Leather Wallet', sku: 'LW-118', category: 'Accessories', price: 39.0, stock: 91, status: 'active', updated: '2026-09-01' }
]

const ORDERS: SellerOrder[] = [
  { id: '#10482', customer: 'Amelia Chen', items: 2, total: 104.98, paymentStatus: 'paid', fulfillmentStatus: 'shipped', placed: '2026-09-11' },
  { id: '#10481', customer: 'Marcus Diaz', items: 1, total: 24.5, paymentStatus: 'paid', fulfillmentStatus: 'processing', placed: '2026-09-11' },
  { id: '#10475', customer: 'Priya Nair', items: 3, total: 428.99, paymentStatus: 'paid', fulfillmentStatus: 'unfulfilled', placed: '2026-09-10' },
  { id: '#10462', customer: 'Tom Baxter', items: 1, total: 45.99, paymentStatus: 'pending', fulfillmentStatus: 'unfulfilled', placed: '2026-09-09' },
  { id: '#10440', customer: 'Sofia Rossi', items: 1, total: 39.0, paymentStatus: 'refunded', fulfillmentStatus: 'delivered', placed: '2026-09-04' },
  { id: '#10391', customer: 'Liam O’Connor', items: 4, total: 217.96, paymentStatus: 'paid', fulfillmentStatus: 'delivered', placed: '2026-08-28' }
]

const INVOICES: SellerInvoice[] = [
  { id: 'INV-2091', order: '#10482', amount: 104.98, issuedDate: '2026-09-11', dueDate: '2026-09-25', status: 'pending' },
  { id: 'INV-2088', order: '#10475', amount: 428.99, issuedDate: '2026-09-10', dueDate: '2026-09-24', status: 'pending' },
  { id: 'INV-2071', order: '#10440', amount: 39.0, issuedDate: '2026-09-04', dueDate: '2026-09-18', status: 'paid' },
  { id: 'INV-2050', order: '#10391', amount: 217.96, issuedDate: '2026-08-28', dueDate: '2026-09-11', status: 'overdue' },
  { id: 'INV-2033', order: '#10322', amount: 66.5, issuedDate: '2026-08-19', dueDate: '2026-09-02', status: 'paid' }
]

const REVIEWS: SellerReview[] = [
  { id: 1, product: 'Wireless Earbuds Pro', customer: 'Amelia Chen', rating: 5, comment: 'Great sound quality and battery life.', status: 'published', date: '2026-09-12' },
  { id: 2, product: 'Adjustable Standing Desk', customer: 'Priya Nair', rating: 4, comment: 'Sturdy but assembly took a while.', status: 'published', date: '2026-09-09' },
  { id: 3, product: 'Ceramic Coffee Mug', customer: 'Tom Baxter', rating: 2, comment: 'Arrived chipped on one side.', status: 'flagged', date: '2026-09-06' },
  { id: 4, product: 'Bluetooth Keyboard', customer: 'Sofia Rossi', rating: 5, comment: 'Exactly as described, fast shipping.', status: 'pending', date: '2026-09-03' },
  { id: 5, product: 'Leather Wallet', customer: 'Liam O’Connor', rating: 3, comment: 'Nice material, stitching could be better.', status: 'published', date: '2026-08-29' }
]

const SHIPMENTS: SellerShipment[] = [
  { id: 1, order: '#10482', carrier: 'UPS', trackingNumber: '1Z999AA10123456784', status: 'in_transit', shipped: '2026-09-11' },
  { id: 2, order: '#10475', carrier: 'USPS', trackingNumber: '9400111899223197428390', status: 'label_created', shipped: '2026-09-10' },
  { id: 3, order: '#10440', carrier: 'FedEx', trackingNumber: '789123456789', status: 'delivered', shipped: '2026-09-04' },
  { id: 4, order: '#10391', carrier: 'UPS', trackingNumber: '1Z999AA10198765432', status: 'out_for_delivery', shipped: '2026-08-29' },
  { id: 5, order: '#10322', carrier: 'DHL', trackingNumber: 'DHL0034821093', status: 'exception', shipped: '2026-08-20' }
]

const SPACES: SellerSpace[] = [
  { id: 1, name: 'Earbuds Owners Club', description: 'Support and tips for Wireless Earbuds Pro buyers.', members: 214, posts: 58, visibility: 'public', created: '2026-06-02' },
  { id: 2, name: 'VIP Customers', description: 'Early access announcements for repeat buyers.', members: 42, posts: 19, visibility: 'invite_only', created: '2026-07-14' },
  { id: 3, name: 'Beta Testers', description: 'Feedback space for upcoming product drops.', members: 17, posts: 33, visibility: 'private', created: '2026-08-01' }
]

const ATTRIBUTES: SellerAttribute[] = [
  { id: 1, name: 'Color', code: 'color', type: 'select', values: 'Black, White, Blue, Red', usedBy: 18 },
  { id: 2, name: 'Size', code: 'size', type: 'select', values: 'S, M, L, XL', usedBy: 22 },
  { id: 3, name: 'Material', code: 'material', type: 'text', values: 'Cotton, Leather, Ceramic', usedBy: 9 },
  { id: 4, name: 'Waterproof', code: 'waterproof', type: 'boolean', values: 'Yes, No', usedBy: 4 },
  { id: 5, name: 'Warranty (months)', code: 'warranty_months', type: 'number', values: '6, 12, 24', usedBy: 11 }
]

const INTEGRATIONS: SellerIntegration[] = [
  { id: 1, name: 'Stripe Payments', provider: 'Stripe', category: 'Payments', status: 'connected', connected: '2026-05-14' },
  { id: 2, name: 'Mailchimp Sync', provider: 'Mailchimp', category: 'Marketing', status: 'connected', connected: '2026-06-20' },
  { id: 3, name: 'UPS Shipping', provider: 'UPS', category: 'Shipping', status: 'error', connected: '2026-07-02' },
  { id: 4, name: 'Google Analytics', provider: 'Google', category: 'Analytics', status: 'pending', connected: null },
  { id: 5, name: 'Zendesk Support', provider: 'Zendesk', category: 'Support', status: 'disconnected', connected: '2026-04-11' }
]

// --- Webkul Multi Vendor Marketplace seller-panel features -------------
// (see contracts/business.ts's file header — additive alongside the
// entities above, mapping onto the real Webkul seller panel that
// Meeovi_MarketplaceApi bridges to)

let SHOP: SellerShopProfile = {
  shopName: "Amelia's Emporium",
  shopUrl: 'amelias-emporium',
  bannerUrl: null,
  logoUrl: null,
  metaDescription: 'Curated electronics, apparel and home goods.',
  shippingPolicy: 'Orders ship within 2 business days via UPS or USPS.',
  returnPolicy: '30-day returns accepted on unused items in original packaging.',
  socialLinks: { instagram: 'https://instagram.com/ameliasemporium' },
  isApproved: true
}

const LOW_STOCK: SellerLowStockItem[] = [
  { id: 3, name: 'Ceramic Coffee Mug', sku: 'CCM-220', stock: 0, threshold: 10 },
  { id: 4, name: 'Adjustable Standing Desk', sku: 'ASD-005', stock: 12, threshold: 15 },
  { id: 5, name: 'Bluetooth Keyboard', sku: 'BTK-330', stock: 27, threshold: 30 }
]

const TRANSACTIONS: SellerTransaction[] = [
  { id: 1, order: '#10482', product: 'Wireless Earbuds Pro', saleAmount: 104.98, commissionRate: 0.1, commissionAmount: 10.5, netEarning: 94.48, date: '2026-09-11' },
  { id: 2, order: '#10481', product: 'Organic Cotton Tee', saleAmount: 24.5, commissionRate: 0.1, commissionAmount: 2.45, netEarning: 22.05, date: '2026-09-11' },
  { id: 3, order: '#10440', product: 'Leather Wallet', saleAmount: 39.0, commissionRate: 0.1, commissionAmount: 3.9, netEarning: 35.1, date: '2026-09-04' },
  { id: 4, order: '#10391', product: 'Adjustable Standing Desk', saleAmount: 217.96, commissionRate: 0.08, commissionAmount: 17.44, netEarning: 200.52, date: '2026-08-28' }
]

const PAYOUTS: SellerPayout[] = [
  { id: 'PO-501', amount: 200.52, method: 'paypal', status: 'paid', requestedDate: '2026-08-29', paidDate: '2026-09-01' },
  { id: 'PO-498', amount: 94.48, method: 'paypal', status: 'pending', requestedDate: '2026-09-12', paidDate: null }
]

const COUPONS: SellerCoupon[] = [
  { id: 1, code: 'WELCOME10', discountType: 'percent', discountValue: 10, usageLimit: 100, usedCount: 34, status: 'active', validFrom: '2026-08-01', validTo: '2026-12-31' },
  { id: 2, code: 'SUMMER5', discountType: 'fixed', discountValue: 5, usageLimit: 50, usedCount: 50, status: 'expired', validFrom: '2026-06-01', validTo: '2026-08-31' },
  { id: 3, code: 'HOLIDAY20', discountType: 'percent', discountValue: 20, usageLimit: 200, usedCount: 0, status: 'scheduled', validFrom: '2026-11-25', validTo: '2026-12-01' }
]

const FEATURED_PRODUCTS: SellerFeaturedProduct[] = [
  { id: 1, product: 'Wireless Earbuds Pro', slot: 'homepage', cost: 25.0, startDate: '2026-09-01', endDate: '2026-09-30', status: 'active' },
  { id: 2, product: 'Adjustable Standing Desk', slot: 'category', cost: 10.0, startDate: '2026-10-01', endDate: '2026-10-31', status: 'pending' }
]

const ANNOUNCEMENTS: SellerAnnouncement[] = [
  { id: 1, title: 'Holiday shipping deadlines', message: 'Submit holiday orders for guaranteed delivery by Dec 20.', from: 'Marketplace Admin', date: '2026-09-10', read: false },
  { id: 2, title: 'New commission tier available', message: 'Sellers with 4.5+ ratings now qualify for a reduced 8% commission rate.', from: 'Marketplace Admin', date: '2026-09-05', read: true },
  { id: 3, title: 'Scheduled maintenance', message: 'The marketplace will be briefly unavailable overnight on Sept 20 for maintenance.', from: 'Marketplace Admin', date: '2026-08-30', read: true }
]

/**
 * Default `BusinessDriverContract` implementation, registered as the
 * fallback business driver by `server/plugins/register-business-driver.ts`.
 *
 * It returns realistic, deterministic seller data so the dashboard is
 * usable today, but it is NOT wired to any real per-seller data source —
 * `sellerId` is accepted (so callers/backends can rely on the contract
 * shape) but not used to filter here. Swapping in a real backend (e.g. the
 * Magento/Webkul `Meeovi_MarketplaceApi` seller endpoints, or Directus once
 * its `orders`/`products` collections gain a `seller_id` field) means
 * implementing `BusinessDriverContract` and calling
 * `registerBusinessAdapter('magento', ...)` / `setDefaultBusinessAdapter(...)`
 * from `alternate-sdk` — no change needed in the Vue composables, pages, or
 * the `/api/business/driver` proxy route.
 */
export class DefaultBusinessAdapter implements BusinessDriverContract {
  products = {
    list: async (params?: SellerListParams): Promise<SellerProduct[]> => paginate(PRODUCTS, params)
  }

  orders = {
    list: async (params?: SellerListParams): Promise<SellerOrder[]> => paginate(ORDERS, params)
  }

  invoices = {
    list: async (params?: SellerListParams): Promise<SellerInvoice[]> => paginate(INVOICES, params)
  }

  reviews = {
    list: async (params?: SellerListParams): Promise<SellerReview[]> => paginate(REVIEWS, params)
  }

  shipments = {
    list: async (params?: SellerListParams): Promise<SellerShipment[]> => paginate(SHIPMENTS, params)
  }

  spaces = {
    list: async (params?: SellerListParams): Promise<SellerSpace[]> => paginate(SPACES, params)
  }

  attributes = {
    list: async (params?: SellerListParams): Promise<SellerAttribute[]> => paginate(ATTRIBUTES, params)
  }

  integrations = {
    list: async (params?: SellerListParams): Promise<SellerIntegration[]> => paginate(INTEGRATIONS, params)
  }

  shop = {
    get: async (): Promise<SellerShopProfile> => SHOP,
    update: async (params: SellerListParams & Partial<SellerShopProfile>): Promise<SellerShopProfile> => {
      const { sellerId, limit, offset, ...updates } = params
      SHOP = { ...SHOP, ...updates }
      return SHOP
    }
  }

  lowStock = {
    list: async (params?: SellerListParams): Promise<SellerLowStockItem[]> => paginate(LOW_STOCK, params)
  }

  transactions = {
    list: async (params?: SellerListParams): Promise<SellerTransaction[]> => paginate(TRANSACTIONS, params)
  }

  payouts = {
    list: async (params?: SellerListParams): Promise<SellerPayout[]> => paginate(PAYOUTS, params),
    request: async (params: SellerListParams & { amount: number; method: SellerPayout['method'] }): Promise<SellerPayout> => {
      const payout: SellerPayout = {
        id: `PO-${500 + PAYOUTS.length + 1}`,
        amount: params.amount,
        method: params.method,
        status: 'pending',
        requestedDate: new Date().toISOString().slice(0, 10),
        paidDate: null
      }
      PAYOUTS.unshift(payout)
      return payout
    }
  }

  coupons = {
    list: async (params?: SellerListParams): Promise<SellerCoupon[]> => paginate(COUPONS, params)
  }

  featuredProducts = {
    list: async (params?: SellerListParams): Promise<SellerFeaturedProduct[]> => paginate(FEATURED_PRODUCTS, params)
  }

  announcements = {
    list: async (params?: SellerListParams): Promise<SellerAnnouncement[]> => paginate(ANNOUNCEMENTS, params)
  }

  async getStats(): Promise<BusinessStats> {
    const unfulfilled = ORDERS.filter((order) => order.fulfillmentStatus === 'unfulfilled').length
    const totalRevenue = ORDERS.reduce((sum, order) => sum + order.total, 0)

    const activeProducts = PRODUCTS.filter((product) => product.status === 'active').length
    const outOfStock = PRODUCTS.filter((product) => product.stock === 0).length

    const averageRating = REVIEWS.length
      ? REVIEWS.reduce((sum, review) => sum + review.rating, 0) / REVIEWS.length
      : 0
    const pendingReviews = REVIEWS.filter((review) => review.status === 'pending').length

    const totalMembers = SPACES.reduce((sum, space) => sum + space.members, 0)
    const totalPosts = SPACES.reduce((sum, space) => sum + space.posts, 0)

    const inTransit = SHIPMENTS.filter((s) => s.status === 'in_transit' || s.status === 'out_for_delivery').length
    const delivered = SHIPMENTS.filter((s) => s.status === 'delivered').length
    const exceptions = SHIPMENTS.filter((s) => s.status === 'exception').length

    return {
      orders: { total: ORDERS.length, unfulfilled, totalRevenue },
      products: { total: PRODUCTS.length, active: activeProducts, outOfStock },
      reviews: { total: REVIEWS.length, averageRating, pending: pendingReviews },
      recentOrders: ORDERS.slice(0, 5),
      spaces: { total: SPACES.length, totalMembers, totalPosts },
      shipments: { inTransit, delivered, exceptions }
    }
  }
}
