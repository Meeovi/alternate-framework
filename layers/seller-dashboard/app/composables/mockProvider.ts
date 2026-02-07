// Simple in-memory mock vendor provider for local/testing when no adapter is installed
type AnyObj = Record<string, any>

const state = {
  products: new Map<string, AnyObj[]>(), // sellerId -> products
  customers: new Map<string, AnyObj[]>(),
  orders: new Map<string, AnyObj[]>(),
  reviews: new Map<string, AnyObj[]>(),
  referrals: new Map<string, AnyObj[]>(),
  shops: new Map<string, AnyObj>(),
  settings: new Map<string, AnyObj>()
}

function ensureList(map: Map<string, AnyObj[]>, key = 'default') {
  if (!map.has(key)) map.set(key, [])
  return map.get(key)!
}

export const mockProvider = {
  name: 'mock',

  // Products
  async listSellerProducts(sellerId?: string, _params?: AnyObj) {
    const key = sellerId || 'default'
    return ensureList(state.products, key).slice()
  },
  async getSellerProduct(productId: string) {
    for (const list of state.products.values()) {
      const p = list.find((x) => x.id === productId || x.sku === productId)
      if (p) return p
    }
    return null
  },
  async createSellerProduct(sellerId: string, payload: AnyObj) {
    const list = ensureList(state.products, sellerId)
    const product = { ...payload, id: String(Date.now()), createdAt: new Date().toISOString() }
    list.push(product)
    return product
  },
  async updateSellerProduct(productId: string, payload: AnyObj) {
    for (const list of state.products.values()) {
      const i = list.findIndex((x) => x.id === productId || x.sku === productId)
      if (i > -1) {
        list[i] = { ...list[i], ...payload }
        return list[i]
      }
    }
    return null
  },
  async deleteSellerProduct(productId: string) {
    for (const [k, list] of state.products.entries()) {
      const i = list.findIndex((x) => x.id === productId || x.sku === productId)
      if (i > -1) {
        list.splice(i, 1)
        return true
      }
    }
    return false
  },

  // Reviews
  async listReviews(productId?: string, _params?: AnyObj) {
    if (productId) return ensureList(state.reviews, productId).slice()
    // flatten
    return Array.from(state.reviews.values()).flat()
  },
  async moderateReview(reviewId: string, action: string) {
    for (const [k, list] of state.reviews.entries()) {
      const i = list.findIndex((r) => r.id === reviewId)
      if (i > -1) {
        if (action === 'delete') list.splice(i, 1)
        else list[i].status = action
        return list[i]
      }
    }
    return null
  },

  // Affiliates / referrals
  async trackReferral(affiliateId: string, data: AnyObj) {
    const list = ensureList(state.referrals, affiliateId)
    const entry = { ...data, id: String(Date.now()), createdAt: new Date().toISOString() }
    list.push(entry)
    return entry
  },
  async getReferrals(affiliateId: string, _params?: AnyObj) {
    return ensureList(state.referrals, affiliateId).slice()
  },

  // Shops
  async listShops(_params?: AnyObj) {
    return Array.from(state.shops.values())
  },
  async getShop(shopId: string) {
    return state.shops.get(shopId) || null
  },
  async updateShop(shopId: string, payload: AnyObj) {
    const existing = state.shops.get(shopId) || { id: shopId }
    state.shops.set(shopId, { ...existing, ...payload })
    return state.shops.get(shopId)
  },

  // Customers
  async listCustomers(_params?: AnyObj) {
    return Array.from(state.customers.values()).flat()
  },
  async getCustomer(customerId: string) {
    for (const list of state.customers.values()) {
      const c = list.find((x) => x.id === customerId)
      if (c) return c
    }
    return null
  },

  // Orders
  async listOrders(_params?: AnyObj) {
    return Array.from(state.orders.values()).flat()
  },
  async getOrder(orderId: string) {
    for (const list of state.orders.values()) {
      const o = list.find((x) => x.id === orderId)
      if (o) return o
    }
    return null
  },
  async updateOrderStatus(orderId: string, status: string) {
    const order = await mockProvider.getOrder(orderId)
    if (!order) return null
    order.status = status
    return order
  },

  // Settings
  async getVendorSettings(scope = 'global') {
    return state.settings.get(scope) || {}
  },
  async updateVendorSettings(scope: string, payload: AnyObj) {
    const existing = state.settings.get(scope) || {}
    const merged = { ...existing, ...payload }
    state.settings.set(scope, merged)
    return merged
  }
  ,
  // Commission
  async getCommissionRate(sellerId: string) {
    const settings = state.settings.get(sellerId) || {}
    return (settings.commissionRate ?? 0.1) as number
  },
  async setCommissionRate(sellerId: string, rate: number) {
    const existing = state.settings.get(sellerId) || {}
    const merged = { ...existing, commissionRate: rate }
    state.settings.set(sellerId, merged)
    return merged
  }
}

export default mockProvider
