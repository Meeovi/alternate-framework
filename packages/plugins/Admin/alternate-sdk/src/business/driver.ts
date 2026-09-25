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
} from '../contracts/business.js'

class BusinessMeshDriver implements BusinessDriverContract {
  products = {
    list: async (params?: SellerListParams): Promise<SellerProduct[]> => {
      throw new Error('Business driver not yet implemented.')
    }
  }

  orders = {
    list: async (params?: SellerListParams): Promise<SellerOrder[]> => {
      throw new Error('Business driver not yet implemented.')
    }
  }

  invoices = {
    list: async (params?: SellerListParams): Promise<SellerInvoice[]> => {
      throw new Error('Business driver not yet implemented.')
    }
  }

  reviews = {
    list: async (params?: SellerListParams): Promise<SellerReview[]> => {
      throw new Error('Business driver not yet implemented.')
    }
  }

  shipments = {
    list: async (params?: SellerListParams): Promise<SellerShipment[]> => {
      throw new Error('Business driver not yet implemented.')
    }
  }

  spaces = {
    list: async (params?: SellerListParams): Promise<SellerSpace[]> => {
      throw new Error('Business driver not yet implemented.')
    }
  }

  attributes = {
    list: async (params?: SellerListParams): Promise<SellerAttribute[]> => {
      throw new Error('Business driver not yet implemented.')
    }
  }

  integrations = {
    list: async (params?: SellerListParams): Promise<SellerIntegration[]> => {
      throw new Error('Business driver not yet implemented.')
    }
  }

  shop = {
    get: async (params?: SellerListParams): Promise<SellerShopProfile> => {
      throw new Error('Business driver not yet implemented.')
    },
    update: async (params: SellerListParams & Partial<SellerShopProfile>): Promise<SellerShopProfile> => {
      throw new Error('Business driver not yet implemented.')
    }
  }

  lowStock = {
    list: async (params?: SellerListParams): Promise<SellerLowStockItem[]> => {
      throw new Error('Business driver not yet implemented.')
    }
  }

  transactions = {
    list: async (params?: SellerListParams): Promise<SellerTransaction[]> => {
      throw new Error('Business driver not yet implemented.')
    }
  }

  payouts = {
    list: async (params?: SellerListParams): Promise<SellerPayout[]> => {
      throw new Error('Business driver not yet implemented.')
    },
    request: async (params: SellerListParams & { amount: number; method: SellerPayout['method'] }): Promise<SellerPayout> => {
      throw new Error('Business driver not yet implemented.')
    }
  }

  coupons = {
    list: async (params?: SellerListParams): Promise<SellerCoupon[]> => {
      throw new Error('Business driver not yet implemented.')
    }
  }

  featuredProducts = {
    list: async (params?: SellerListParams): Promise<SellerFeaturedProduct[]> => {
      throw new Error('Business driver not yet implemented.')
    }
  }

  announcements = {
    list: async (params?: SellerListParams): Promise<SellerAnnouncement[]> => {
      throw new Error('Business driver not yet implemented.')
    }
  }

  async getStats(params?: SellerListParams): Promise<BusinessStats> {
    throw new Error('Business driver not yet implemented.')
  }
}

export default BusinessMeshDriver
