import { createError } from 'h3'
import type {
  BusinessDriverContract,
  BusinessStats,
  SellerListParams,
  SellerPayout,
  SellerShopProfile
} from 'alternate-sdk/contracts'

const none = async () => []

const notLinked = () => createError({
  statusCode: 409,
  statusMessage: "Your account isn't linked to a seller account on the store yet",
})

/**
 * The fallback behind a real business backend (MagentoBusinessAdapter):
 * every domain that backend has no source for answers empty, and writes are
 * refused. `DefaultBusinessAdapter`'s sample data is for `BUSINESS_BACKEND=mock`
 * only — behind a real backend it showed sellers made-up orders, payouts and
 * reviews as if they were theirs.
 */
export class EmptyBusinessAdapter implements BusinessDriverContract {
  products = { list: none }
  orders = { list: none }
  invoices = { list: none }
  reviews = { list: none }
  shipments = { list: none }
  spaces = { list: none }
  attributes = { list: none }
  integrations = { list: none }
  lowStock = { list: none }
  transactions = { list: none }
  coupons = { list: none }
  featuredProducts = { list: none }
  announcements = { list: none }

  // Payouts aren't built on PayPal yet: there's nothing to list, and a
  // request must not look accepted.
  payouts = {
    list: none,
    request: async (_params: SellerListParams & { amount: number; method: SellerPayout['method'] }): Promise<SellerPayout> => {
      throw createError({ statusCode: 501, statusMessage: 'Payouts are not available yet' })
    }
  }

  shop = {
    get: async (): Promise<SellerShopProfile> => ({
      shopName: '',
      shopUrl: '',
      bannerUrl: null,
      logoUrl: null,
      metaDescription: '',
      shippingPolicy: '',
      returnPolicy: '',
      socialLinks: {},
      isApproved: false
    }),
    update: async (): Promise<SellerShopProfile> => {
      throw notLinked()
    }
  }

  async getStats(): Promise<BusinessStats> {
    return {
      orders: { total: 0, unfulfilled: 0, totalRevenue: 0 },
      products: { total: 0, active: 0, outOfStock: 0 },
      reviews: { total: 0, averageRating: 0, pending: 0 },
      recentOrders: [],
      spaces: { total: 0, totalMembers: 0, totalPosts: 0 },
      shipments: { inTransit: 0, delivered: 0, exceptions: 0 }
    }
  }
}
