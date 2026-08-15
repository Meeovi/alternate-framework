// packages/adapters/adapter-magento/src/index.ts
import { GraphQLClient } from 'graphql-request'
import type { Query } from './graphql/schema-types' // Generated via mesh-compose types
import { normalizeProductToPage } from './normalizers/normalizers'
import type { RawMagentoInventory } from './normalizers/inventory'

export class MagentoAdapter {
  [x: string]: any;
  private client: GraphQLClient

  // Namespace our calls to match your normalized alternate-sdk footprint
  public store = {
    /**
     * Reads complex product or category matrices from Magento through the composed Mesh.
     * `entity` is the Magento query/entity name (e.g. "Product", "InventorySource").
     */
    readEntity: async (
      entity: string,
      argumentsPayload: Record<string, any>,
      options: { fields: string[] | Record<string, any>[] | any }
    ): Promise<any> => {
      const selectionString = this.parseFieldsToQuery(options.fields as any[])
      const inlineArgs = this.serializeArguments(argumentsPayload)
      const argumentString = inlineArgs ? `(${inlineArgs})` : ''

      // Support both raw Magento (lowercase root fields) and GraphQL Mesh (prefixed)
      const candidates = [
        `Mage_${entity}`,                            // GraphQL Mesh with Mage_ prefix
        entity,                                      // Raw Magento if already lowercase
        `${entity.charAt(0).toLowerCase()}${entity.slice(1)}`, // Raw Magento PascalCase -> camelCase
      ]

      for (const meshKey of candidates) {
        try {
          const query = `
            query GetMagentoEntity {
              ${String(meshKey)}${argumentString} {
                ${selectionString}
              }
            }
          `
          const data = await this.client.request<Record<string, any>>(query)
          const result = data[meshKey] ?? data[meshKey.toLowerCase()]
          if (result !== undefined) return result
        } catch {
          // Try next candidate
        }
      }

      throw new Error(`Failed to query Magento entity: ${entity}`)
    },

    /**
     * Same shape as readEntity, but emits a `mutation` document instead of a
     * `query` — readEntity's candidates never match a mutation root field,
     * so writes need their own path.
     */
    mutateEntity: async (
      mutationName: string,
      argumentsPayload: Record<string, any>,
      options: { fields: string[] | Record<string, any>[] | any }
    ): Promise<any> => {
      const selectionString = this.parseFieldsToQuery(options.fields as any[])
      const inlineArgs = this.serializeArguments(argumentsPayload)
      const argumentString = inlineArgs ? `(${inlineArgs})` : ''

      const query = `
        mutation MutateMagentoEntity {
          ${mutationName}${argumentString} {
            ${selectionString}
          }
        }
      `
      const data = await this.client.request<Record<string, any>>(query)
      return data[mutationName]
    },

    /**
     * Queries an exact root query field, with no Mage_/camelCase candidate
     * guessing — readEntity's candidates assume a singular per-entity root
     * field (Mage_Product/Product/product), which doesn't exist on stock
     * Magento's GraphQL schema. The real storefront schema exposes plural,
     * search-style root fields instead (products/categories), each with
     * its own filter argument name and a paginated `{ items, total_count }`
     * shape — this calls one of those directly.
     */
    queryField: async (
      fieldName: string,
      argumentsPayload: Record<string, any>,
      options: { fields: string[] | Record<string, any>[] | any }
    ): Promise<any> => {
      const selectionString = this.parseFieldsToQuery(options.fields as any[])
      const inlineArgs = this.serializeArguments(argumentsPayload)
      const argumentString = inlineArgs ? `(${inlineArgs})` : ''

      const query = `
        query GetMagentoField {
          ${fieldName}${argumentString} {
            ${selectionString}
          }
        }
      `
      const data = await this.client.request<Record<string, any>>(query)
      return data[fieldName]
    }
  }

  public content = {
    // Search namespace - implements SearchAdapter interface.
    // Uses the real `products(search: ...)` root field (full-text search)
    // rather than readEntity — Magento's storefront schema has no singular
    // Product/Mage_Product query field for readEntity's candidates to match.
    search: async (query: string, options?: Record<string, any>) => {
      // `price` is not a scalar on ProductInterface (confirmed live) — only
      // `price_range` (an object) exists, hence the default field shape below.
      const defaultFields = ['sku', 'name', { price_range: [{ minimum_price: [{ final_price: ['value'] }] }] }]
      const result = await this.store.queryField('products', {
        search: query,
        pageSize: options?.pageSize || 20,
      }, { fields: [{ items: options?.fields || defaultFields }, 'total_count'] })
      return result?.items ?? []
    },

    suggest: async (query: string) => {
      const result = await this.store.queryField('products', {
        search: query,
        pageSize: 10,
      }, { fields: [{ items: ['name'] }] })
      const items = result?.items ?? []
      return items.map((item: any) => item.name).filter(Boolean)
    },

    index: async (doc: Record<string, any>) => {
      // Magento indexes products through its own indexing pipeline; no-op placeholder
    },

    stats: async () => {
      return { indexed: 0 }
    },

    clear: async () => {
      // No-op for Magento
    },

    // Auth namespace - implements AuthAdapter interface
    auth: {
      login: async (payload: Record<string, any>) => {
        // Magento customer login via GraphQL mutation would go here
        return {}
      },

      logout: async () => {
        // Magento logout would go here
      },

      getSession: async () => {
        // Magento session retrieval would go here
        return null
      },

      getProfile: async () => {
        // Magento customer profile would go here
        return null
      },

      updateProfile: async (payload: Record<string, any>) => {
        // Magento profile update would go here
        return {}
      },

      register: async (payload: Record<string, any>) => {
        // Magento customer registration would go here
        return {}
      },
    },

    // Notifications namespace - implements NotifyAdapter interface
    notifications: {
      notify: async (payload: Record<string, any>) => {
        // Placeholder
      },

      dismiss: async (id: string) => {
        // Placeholder
      },

      clear: async () => {
        // Placeholder
      },

      listNotifications: async () => {
        return []
      },

      getNotificationsSnapshot: async () => {
        return { notifications: [], unreadCount: 0 }
      },

      markNotificationAsRead: async () => {
        // Placeholder
      },

      markAllNotificationsAsRead: async () => {
        // Placeholder
      },
    },
  }

  public commerce = {
    getProducts: async (params?: Record<string, any>) => {
      const filter = params?.filter || {}
      const fields = params?.fields || ['sku', 'name', 'price', 'image']
      const data = await this.store.readEntity('Product', filter, { fields })
      return Array.isArray(data) ? data : (data?.items ?? [])
    },

    getProductById: async (id: string) => {
      const data = await this.store.readEntity('Product', { id }, { fields: ['sku', 'name', 'price'] })
      return Array.isArray(data) ? data[0] : (data?.items?.[0] ?? null)
    },

    getProductBySku: async (sku: string) => {
      const data = await this.store.readEntity('Product', { sku }, { fields: ['sku', 'name', 'price'] })
      return Array.isArray(data) ? data[0] : (data?.items?.[0] ?? null)
    },

    getProductBySlug: async (slug: string) => {
      const data = await this.store.readEntity('Product', { url_key: { eq: slug } }, { fields: ['sku', 'name', 'price'] })
      return Array.isArray(data) ? data[0] : (data?.items?.[0] ?? null)
    },

    getCategories: async (params?: Record<string, any>) => {
      const filter = params?.filter || {}
      const fields = params?.fields || ['id', 'name', 'slug']
      const data = await this.store.readEntity('Category', filter, { fields })
      return Array.isArray(data) ? data : (data?.items ?? [])
    },

    getCategory: async (id: string) => {
      const data = await this.store.readEntity('Category', { id }, { fields: ['id', 'name', 'slug'] })
      return Array.isArray(data) ? data[0] : (data?.items?.[0] ?? null)
    },

    getCategoryTree: async (params?: Record<string, any>) => {
      const filter = params?.filter || {}
      const fields = params?.fields || ['id', 'name', 'slug', 'children']
      const data = await this.store.readEntity('Category', filter, { fields })
      return Array.isArray(data) ? data : (data?.items ?? [])
    },

    getCart: async () => null,

    addCartLineItem: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Cart', { item: payload }, { fields: ['id', 'items'] })
    },

    updateCartLineItem: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Cart', { item: payload }, { fields: ['id', 'items'] })
    },

    removeCartLineItem: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Cart', { item: payload }, { fields: ['id', 'items'] })
    },

    applyCouponToCart: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Cart', { coupon: payload }, { fields: ['id', 'items'] })
    },

    removeCouponFromCart: async () => {
      return await this.store.readEntity('Cart', {}, { fields: ['id', 'items'] })
    },

    calculateCartPrices: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Cart', { item: payload }, { fields: ['id', 'items'] })
    },

    priceCartItem: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Cart', { item: payload }, { fields: ['id', 'items'] })
    },

    estimateShippingMethods: async (payload: Record<string, any>) => {
      return await this.store.readEntity('ShippingMethod', payload, { fields: ['code', 'name'] })
    },

    listShippingMethods: async () => {
      return await this.store.readEntity('ShippingMethod', {}, { fields: ['code', 'name'] })
    },

    selectShippingMethod: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Cart', { method: payload }, { fields: ['id', 'items'] })
    },

    setShippingMethod: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Cart', { method: payload }, { fields: ['id', 'items'] })
    },

    getCustomer: async () => null,

    /**
     * Creates a real Magento customer record. Used to give a customer/order
     * scope anchor for a user that authenticated elsewhere (better-auth) —
     * this customer is never used for Magento login, so the password is a
     * throwaway random value the caller never sees.
     *
     * Confirmed live against a real Magento instance: `Customer.id` always
     * resolves to null over GraphQL here (both immediately after creation
     * and when queried with the customer's own fresh token) — this store's
     * config doesn't expose it. The real numeric id IS embedded in the
     * customer token's JWT payload (`uid` claim) though, so a token is
     * generated right after creation purely to recover the id.
     */
    createCustomer: async (payload: { firstname: string; lastname: string; email: string }) => {
      const password = `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}Aa1!`
      const data = await this.store.mutateEntity('createCustomerV2', {
        input: { firstname: payload.firstname, lastname: payload.lastname, email: payload.email, password },
      }, { fields: [{ customer: ['id', 'email', 'firstname', 'lastname'] }] })
      const customer = data?.customer
      if (!customer) return null
      if (customer.id) return customer

      try {
        const tokenData = await this.store.mutateEntity('generateCustomerToken', {
          email: payload.email,
          password,
        }, { fields: ['token'] })
        const token = tokenData?.token
        const payloadJson = token ? Buffer.from(token.split('.')[1], 'base64').toString('utf8') : null
        const uid = payloadJson ? JSON.parse(payloadJson)?.uid : null
        return uid ? { ...customer, id: uid } : customer
      } catch {
        // Id recovery failing shouldn't fail the whole signup — the caller
        // just won't get a linkable id this time.
        return customer
      }
    },

    createCustomerAddress: async (payload: Record<string, any>) => {
      return await this.store.readEntity('CustomerAddress', payload, { fields: ['id', 'name'] })
    },

    getCustomerAddresses: async () => {
      return await this.store.readEntity('CustomerAddress', {}, { fields: ['id', 'name'] })
    },

    updateCustomerAddress: async (payload: Record<string, any>) => {
      return await this.store.readEntity('CustomerAddress', payload, { fields: ['id', 'name'] })
    },

    deleteCustomerAddress: async (id: string) => {
      return await this.store.readEntity('CustomerAddress', { id }, { fields: ['id'] })
    },

    getCustomerGroups: async () => {
      return await this.store.readEntity('CustomerGroup', {}, { fields: ['id', 'name'] })
    },

    getOrders: async (params?: Record<string, any>) => {
      const filter = params?.filter || {}
      const data = await this.store.readEntity('Order', filter, { fields: ['id', 'increment_id'] })
      return Array.isArray(data) ? data : (data?.items ?? [])
    },

    listOrders: async () => {
      const data = await this.store.readEntity('Order', {}, { fields: ['id', 'increment_id'] })
      return Array.isArray(data) ? data : (data?.items ?? [])
    },

    getOrder: async (id: string) => {
      const data = await this.store.readEntity('Order', { id }, { fields: ['id', 'increment_id'] })
      return Array.isArray(data) ? data[0] : (data?.items?.[0] ?? null)
    },

    getOrderByIncrementId: async (incrementId: string) => {
      const data = await this.store.readEntity('Order', { increment_id: incrementId }, { fields: ['id', 'increment_id'] })
      return Array.isArray(data) ? data[0] : (data?.items?.[0] ?? null)
    },

    createOrder: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Order', payload, { fields: ['id', 'increment_id'] })
    },

    createPosOrder: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Order', payload, { fields: ['id', 'increment_id'] })
    },

    orderBySku: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Order', payload, { fields: ['id', 'increment_id'] })
    },

    getInvoices: async (orderId: string) => {
      return await this.store.readEntity('Invoice', { order_id: orderId }, { fields: ['id', 'increment_id'] })
    },

    listInvoices: async (params?: Record<string, any>) => {
      const filter = params?.filter || {}
      return await this.store.readEntity('Invoice', filter, { fields: ['id', 'increment_id'] })
    },

    getInvoice: async (id: string) => {
      const data = await this.store.readEntity('Invoice', { id }, { fields: ['id', 'increment_id'] })
      return Array.isArray(data) ? data[0] : (data?.items?.[0] ?? null)
    },

    createShipment: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Shipment', payload, { fields: ['id', 'increment_id'] })
    },

    bookShipment: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Shipment', payload, { fields: ['id', 'increment_id'] })
    },

    cancelShipment: async (id: string) => {
      return await this.store.readEntity('Shipment', { id }, { fields: ['id'] })
    },

    cancelShipmentBooking: async (id: string) => {
      return await this.store.readEntity('Shipment', { id }, { fields: ['id'] })
    },

    trackShipment: async (id: string) => {
      return await this.store.readEntity('Shipment', { id }, { fields: ['id', 'tracking_number'] })
    },

    getTrackingInfo: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Shipment', payload, { fields: ['id', 'tracking_number'] })
    },

    getCreditMemos: async (orderId: string) => {
      return await this.store.readEntity('CreditMemo', { order_id: orderId }, { fields: ['id', 'increment_id'] })
    },

    listCreditMemos: async (params?: Record<string, any>) => {
      const filter = params?.filter || {}
      return await this.store.readEntity('CreditMemo', filter, { fields: ['id', 'increment_id'] })
    },

    getCreditMemo: async (id: string) => {
      const data = await this.store.readEntity('CreditMemo', { id }, { fields: ['id', 'increment_id'] })
      return Array.isArray(data) ? data[0] : (data?.items?.[0] ?? null)
    },

    listCoupons: async () => {
      return await this.store.readEntity('Coupon', {}, { fields: ['code', 'name'] })
    },

    applyCoupon: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Cart', { coupon: payload }, { fields: ['id', 'items'] })
    },

    removeCoupon: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Cart', { coupon: payload }, { fields: ['id', 'items'] })
    },

    validateCoupon: async (code: string) => {
      const data = await this.store.readEntity('Coupon', { code }, { fields: ['code'] })
      return Array.isArray(data) ? data.length > 0 : (data?.items?.length ?? 0) > 0
    },

    getCoupon: async (code: string) => {
      const data = await this.store.readEntity('Coupon', { code }, { fields: ['code', 'name'] })
      return Array.isArray(data) ? data[0] : (data?.items?.[0] ?? null)
    },

    getRewards: async () => {
      return await this.store.readEntity('Reward', {}, { fields: ['id', 'points'] })
    },

    listRewards: async () => {
      return await this.store.readEntity('Reward', {}, { fields: ['id', 'points'] })
    },

    getRewardBalance: async (customerId?: string) => {
      return await this.store.readEntity('Reward', { customer_id: customerId }, { fields: ['id', 'points'] })
    },

    redeemReward: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Reward', payload, { fields: ['id', 'points'] })
    },

    listGiftCards: async () => {
      return await this.store.readEntity('GiftCard', {}, { fields: ['code', 'balance'] })
    },

    listGiftCertificates: async () => {
      return await this.store.readEntity('GiftCertificate', {}, { fields: ['code', 'balance'] })
    },

    applyGiftCard: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Cart', { gift_card: payload }, { fields: ['id', 'items'] })
    },

    applyGiftCertificate: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Cart', { gift_certificate: payload }, { fields: ['id', 'items'] })
    },

    addToCompare: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Compare', payload, { fields: ['id', 'items'] })
    },

    removeFromCompare: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Compare', payload, { fields: ['id', 'items'] })
    },

    getComparedProducts: async () => {
      return await this.store.readEntity('Compare', {}, { fields: ['id', 'items'] })
    },

    listDiscounts: async () => {
      return await this.store.readEntity('Discount', {}, { fields: ['id', 'name'] })
    },

    getPromotions: async () => {
      return await this.store.readEntity('Promotion', {}, { fields: ['id', 'name'] })
    },

    getDiscountForCart: async (cartId: string) => {
      return await this.store.readEntity('Discount', { cart_id: cartId }, { fields: ['id', 'name'] })
    },

    calculateDiscounts: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Cart', payload, { fields: ['id', 'items'] })
    },

    getSpecialOffer: async (id: string) => {
      return await this.store.readEntity('SpecialOffer', { id }, { fields: ['id', 'name'] })
    },

    listSpecialOffers: async () => {
      return await this.store.readEntity('SpecialOffer', {}, { fields: ['id', 'name'] })
    },

    getCatalogPriceRules: async () => {
      return await this.store.readEntity('CatalogPriceRule', {}, { fields: ['id', 'name'] })
    },

    listCatalogPriceRules: async () => {
      return await this.store.readEntity('CatalogPriceRule', {}, { fields: ['id', 'name'] })
    },

    getCartPriceRules: async () => {
      return await this.store.readEntity('CartPriceRule', {}, { fields: ['id', 'name'] })
    },

    listCartPriceRules: async () => {
      return await this.store.readEntity('CartPriceRule', {}, { fields: ['id', 'name'] })
    },

    getCatalogPriceBySku: async (sku: string) => {
      return await this.store.readEntity('Product', { sku }, { fields: ['sku', 'price'] })
    },

    getCatalogPriceForProduct: async (productId: string) => {
      return await this.store.readEntity('Product', { id: productId }, { fields: ['sku', 'price'] })
    },

    getMinimumAdvertisedPrice: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Product', payload, { fields: ['sku', 'price'] })
    },

    getSuggestedRetailPrice: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Product', payload, { fields: ['sku', 'price'] })
    },

    getDynamicBlockById: async (id: string) => {
      return await this.store.readEntity('DynamicBlock', { id }, { fields: ['id', 'name'] })
    },

    listDynamicBlocks: async (params?: Record<string, any>) => {
      const filter = params?.filter || {}
      return await this.store.readEntity('DynamicBlock', filter, { fields: ['id', 'name'] })
    },

    getCatalogEventById: async (id: string) => {
      return await this.store.readEntity('Event', { id }, { fields: ['id', 'name'] })
    },

    listCatalogEvents: async (params?: Record<string, any>) => {
      const filter = params?.filter || {}
      return await this.store.readEntity('Event', filter, { fields: ['id', 'name'] })
    },

    getCompanyCredits: async (companyId?: string) => {
      return await this.store.readEntity('CompanyCredit', { company_id: companyId }, { fields: ['id', 'balance'] })
    },

    updateCreditBalance: async (payload: Record<string, any>) => {
      return await this.store.readEntity('CompanyCredit', payload, { fields: ['id', 'balance'] })
    },

    getGiftRegistryById: async (id: string) => {
      return await this.store.readEntity('GiftRegistry', { id }, { fields: ['id', 'name'] })
    },

    listGiftRegistries: async () => {
      return await this.store.readEntity('GiftRegistry', {}, { fields: ['id', 'name'] })
    },

    createGiftRegistry: async (payload: Record<string, any>) => {
      return await this.store.readEntity('GiftRegistry', payload, { fields: ['id', 'name'] })
    },

    updateGiftRegistry: async (payload: Record<string, any>) => {
      return await this.store.readEntity('GiftRegistry', payload, { fields: ['id', 'name'] })
    },

    addGiftRegistryItem: async (payload: Record<string, any>) => {
      return await this.store.readEntity('GiftRegistry', { item: payload }, { fields: ['id', 'items'] })
    },

    removeGiftRegistryItem: async (payload: Record<string, any>) => {
      return await this.store.readEntity('GiftRegistry', { item: payload }, { fields: ['id', 'items'] })
    },

    getStoreCredit: async (customerId?: string) => {
      return await this.store.readEntity('StoreCredit', { customer_id: customerId }, { fields: ['id', 'balance'] })
    },

    updateStoreCredit: async (payload: Record<string, any>) => {
      return await this.store.readEntity('StoreCredit', payload, { fields: ['id', 'balance'] })
    },

    applyStoreCreditToCart: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Cart', { credit: payload }, { fields: ['id', 'items'] })
    },

    getCatalogPermissions: async (userId?: string) => {
      return await this.store.readEntity('Permission', { user_id: userId }, { fields: ['id', 'name'] })
    },

    getUserRoles: async (userId?: string) => {
      return await this.store.readEntity('Role', { user_id: userId }, { fields: ['id', 'name'] })
    },

    createRMA: async (payload: Record<string, any>) => {
      return await this.store.readEntity('RMA', payload, { fields: ['id', 'name'] })
    },

    listReturns: async (params?: Record<string, any>) => {
      const filter = params?.filter || {}
      return await this.store.readEntity('RMA', filter, { fields: ['id', 'name'] })
    },

    getReturn: async (id: string) => {
      const data = await this.store.readEntity('RMA', { id }, { fields: ['id', 'name'] })
      return Array.isArray(data) ? data[0] : (data?.items?.[0] ?? null)
    },

    createReturn: async (payload: Record<string, any>) => {
      return await this.store.readEntity('RMA', payload, { fields: ['id', 'name'] })
    },

    getNegotiableCredits: async (companyId?: string) => {
      return await this.store.readEntity('NegotiableCredit', { company_id: companyId }, { fields: ['id', 'balance'] })
    },

    applyCreditToQuote: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Quote', payload, { fields: ['id', 'name'] })
    },

    getCompanyHierarchy: async (companyId?: string) => {
      return await this.store.readEntity('Company', { parent_id: companyId }, { fields: ['id', 'name'] })
    },

    getTeams: async (companyId?: string) => {
      return await this.store.readEntity('Team', { company_id: companyId }, { fields: ['id', 'name'] })
    },

    listSharedCatalogs: async () => {
      return await this.store.readEntity('SharedCatalog', {}, { fields: ['id', 'name'] })
    },

    getSharedCatalogById: async (id: string) => {
      return await this.store.readEntity('SharedCatalog', { id }, { fields: ['id', 'name'] })
    },

    createCompanyAccount: async (payload: Record<string, any>) => {
      return await this.store.readEntity('CompanyAccount', payload, { fields: ['id', 'name'] })
    },

    getCompanyAccountById: async (id: string) => {
      return await this.store.readEntity('CompanyAccount', { id }, { fields: ['id', 'name'] })
    },

    listCompanyAccounts: async () => {
      return await this.store.readEntity('CompanyAccount', {}, { fields: ['id', 'name'] })
    },

    updateCompanyAccount: async (payload: Record<string, any>) => {
      return await this.store.readEntity('CompanyAccount', payload, { fields: ['id', 'name'] })
    },

    deleteCompanyAccount: async (id: string) => {
      return await this.store.readEntity('CompanyAccount', { id }, { fields: ['id'] })
    },

    createApprovalRule: async (payload: Record<string, any>) => {
      return await this.store.readEntity('ApprovalRule', payload, { fields: ['id', 'name'] })
    },

    listApprovalRules: async () => {
      return await this.store.readEntity('ApprovalRule', {}, { fields: ['id', 'name'] })
    },

    updateApprovalRule: async (payload: Record<string, any>) => {
      return await this.store.readEntity('ApprovalRule', payload, { fields: ['id', 'name'] })
    },

    deleteApprovalRule: async (id: string) => {
      return await this.store.readEntity('ApprovalRule', { id }, { fields: ['id'] })
    },

    listAdminActionLogs: async () => {
      return await this.store.readEntity('AdminActionLog', {}, { fields: ['id', 'action'] })
    },

    createPurchaseOrder: async (payload: Record<string, any>) => {
      return await this.store.readEntity('PurchaseOrder', payload, { fields: ['id', 'name'] })
    },

    getPurchaseOrderById: async (id: string) => {
      return await this.store.readEntity('PurchaseOrder', { id }, { fields: ['id', 'name'] })
    },

    listPurchaseOrders: async () => {
      return await this.store.readEntity('PurchaseOrder', {}, { fields: ['id', 'name'] })
    },

    updatePurchaseOrder: async (payload: Record<string, any>) => {
      return await this.store.readEntity('PurchaseOrder', payload, { fields: ['id', 'name'] })
    },

    deletePurchaseOrder: async (id: string) => {
      return await this.store.readEntity('PurchaseOrder', { id }, { fields: ['id'] })
    },

    createQuote: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Quote', payload, { fields: ['id', 'name'] })
    },

    getQuote: async (id: string) => {
      return await this.store.readEntity('Quote', { id }, { fields: ['id', 'name'] })
    },

    listQuotes: async () => {
      return await this.store.readEntity('Quote', {}, { fields: ['id', 'name'] })
    },

    acceptQuote: async (id: string) => {
      return await this.store.readEntity('Quote', { id }, { fields: ['id', 'name'] })
    },

    createRequisitionList: async (payload: Record<string, any>) => {
      return await this.store.readEntity('RequisitionList', payload, { fields: ['id', 'name'] })
    },

    getRequisitionListById: async (id: string) => {
      return await this.store.readEntity('RequisitionList', { id }, { fields: ['id', 'name'] })
    },

    listRequisitionLists: async () => {
      return await this.store.readEntity('RequisitionList', {}, { fields: ['id', 'name'] })
    },

    updateRequisitionList: async (payload: Record<string, any>) => {
      return await this.store.readEntity('RequisitionList', payload, { fields: ['id', 'name'] })
    },

    deleteRequisitionList: async (id: string) => {
      return await this.store.readEntity('RequisitionList', { id }, { fields: ['id'] })
    },

    addRequisitionListItem: async (payload: Record<string, any>) => {
      return await this.store.readEntity('RequisitionList', { item: payload }, { fields: ['id', 'items'] })
    },

    removeRequisitionListItem: async (payload: Record<string, any>) => {
      return await this.store.readEntity('RequisitionList', { item: payload }, { fields: ['id', 'items'] })
    },

    getInvitations: async () => {
      return await this.store.readEntity('Invitation', {}, { fields: ['id', 'email'] })
    },

    sendInvitation: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Invitation', payload, { fields: ['id', 'email'] })
    },

    resendInvitation: async (id: string) => {
      return await this.store.readEntity('Invitation', { id }, { fields: ['id', 'email'] })
    },

    cancelInvitation: async (id: string) => {
      return await this.store.readEntity('Invitation', { id }, { fields: ['id'] })
    },

    listAffiliates: async () => {
      return await this.store.readEntity('Affiliate', {}, { fields: ['id', 'name'] })
    },

    getAffiliateSummary: async (affiliateId?: string) => {
      return await this.store.readEntity('Affiliate', { id: affiliateId }, { fields: ['id', 'name'] })
    },

    listChannels: async () => {
      return await this.store.readEntity('Channel', {}, { fields: ['id', 'name'] })
    },

    setChannel: async (channel: string) => {
      return await this.store.readEntity('Channel', { code: channel }, { fields: ['id', 'name'] })
    },

    getPoll: async (id: string) => {
      return await this.store.readEntity('Poll', { id }, { fields: ['id', 'question'] })
    },

    listPolls: async () => {
      return await this.store.readEntity('Poll', {}, { fields: ['id', 'question'] })
    },

    votePoll: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Poll', payload, { fields: ['id', 'question'] })
    },

    getGlossaryTermBySlug: async (slug: string) => {
      return await this.store.readEntity('GlossaryTerm', { slug }, { fields: ['id', 'term'] })
    },

    listGlossaryTerms: async () => {
      return await this.store.readEntity('GlossaryTerm', {}, { fields: ['id', 'term'] })
    },

    getStores: async () => {
      return await this.store.readEntity('Store', {}, { fields: ['id', 'name'] })
    },

    listCarriers: async () => {
      return await this.store.readEntity('Carrier', {}, { fields: ['id', 'name'] })
    },

    listRegisters: async () => {
      return await this.store.readEntity('Register', {}, { fields: ['id', 'name'] })
    },

    listPaymentGateways: async () => {
      return await this.store.readEntity('PaymentGateway', {}, { fields: ['id', 'name'] })
    },

    getPaymentGateway: async (id: string) => {
      return await this.store.readEntity('PaymentGateway', { id }, { fields: ['id', 'name'] })
    },

    listPayments: async () => {
      return await this.store.readEntity('Payment', {}, { fields: ['id', 'amount'] })
    },

    listTransactions: async () => {
      return await this.store.readEntity('Transaction', {}, { fields: ['id', 'amount'] })
    },

    getTransaction: async (id: string) => {
      return await this.store.readEntity('Transaction', { id }, { fields: ['id', 'amount'] })
    },

    listShippingIntegrations: async () => {
      return await this.store.readEntity('ShippingIntegration', {}, { fields: ['id', 'name'] })
    },

    addGiftMessage: async (payload: Record<string, any>) => {
      return await this.store.readEntity('GiftMessage', payload, { fields: ['id', 'message'] })
    },

    getGiftMessages: async () => {
      return await this.store.readEntity('GiftMessage', {}, { fields: ['id', 'message'] })
    },

    updateGiftMessage: async (payload: Record<string, any>) => {
      return await this.store.readEntity('GiftMessage', payload, { fields: ['id', 'message'] })
    },

    deleteGiftMessage: async (id: string) => {
      return await this.store.readEntity('GiftMessage', { id }, { fields: ['id'] })
    },

    listGiftWrappingOptions: async () => {
      return await this.store.readEntity('GiftWrapping', {}, { fields: ['id', 'name'] })
    },

    addGiftWrapToCart: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Cart', { wrap: payload }, { fields: ['id', 'items'] })
    },

    removeGiftWrapFromCart: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Cart', { wrap: payload }, { fields: ['id', 'items'] })
    },

    sendToAFriend: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Friend', payload, { fields: ['id', 'email'] })
    },

    tellAFriend: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Friend', payload, { fields: ['id', 'email'] })
    },

    trackEvent: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Event', payload, { fields: ['id', 'name'] })
    },

    trackReferral: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Referral', payload, { fields: ['id', 'code'] })
    },

    createReservation: async (payload: Record<string, any>) => {
      return await this.store.readEntity('Reservation', payload, { fields: ['id', 'name'] })
    },

    listReservations: async () => {
      return await this.store.readEntity('Reservation', {}, { fields: ['id', 'name'] })
    },

    updateStock: async (payload: Record<string, any>) => {
      return await this.store.readEntity('StockItem', payload, { fields: ['sku', 'qty'] })
    },

    getStock: async (payload: Record<string, any>) => {
      return await this.store.readEntity('StockItem', payload, { fields: ['sku', 'qty'] })
    },

    getStockByProductId: async (productId: string) => {
      return this.getStockBySku(productId)
    },

    checkInventory: async (sku: string, qty: number) => {
      const stock = await this.getStockBySku(sku)
      return !!stock && (stock.qty ?? 0) >= qty
    },

    listInventorySources: async () => {
      const data = await this.store.readEntity('InventorySource', {}, { fields: ['code', 'name', 'enabled', 'type'] })
      const sources = Array.isArray(data) ? data : (data?.items ?? [])
      return sources.map((source: any) => ({
        id: source.code,
        code: source.code,
        name: source.name,
        enabled: source.enabled ?? true,
        type: source.type ?? 'default',
      }))
    },

    listInventorySourceItems: async (params: { sourceCode: string; skus: string[] }) => {
      const data = await this.store.readEntity('SourceItem', {
        source_code: params.sourceCode,
        skus: params.skus,
      }, { fields: ['sku', 'source_code', 'quantity', 'status'] })
      const items = Array.isArray(data) ? data : (data?.items ?? [])
      return items.map((item: any) => ({
        productId: item.sku,
        sku: item.sku,
        sourceId: item.source_code,
        qty: typeof item.quantity === 'number' ? item.quantity : 0,
        minQty: 0,
        useConfigMinQty: true,
        isInStock: item.status === 1,
        notifyStockQty: 1,
      }))
    },

    assignStockToSource: async (payload: { sourceCode: string; sku: string; qty: number; status?: number }) => {
      return await this.store.readEntity('SourceItem', {
        source_code: payload.sourceCode,
        sku: payload.sku,
        quantity: payload.qty,
        status: payload.status ?? 1,
      }, { fields: ['sku', 'source_code', 'quantity', 'status'] })
    },

    listTaxRates: async () => {
      return await this.store.readEntity('TaxRate', {}, { fields: ['id', 'code', 'rate'] })
    },

    listTax: async () => {
      return await this.store.readEntity('Tax', {}, { fields: ['id', 'name'] })
    },

    request: async (query: string, variables?: Record<string, any>) => {
      return this.client.request(query, variables)
    },
  }

  /**
   * Inventory (MSI) contract — implements the layer's CommerceClient interface.
   * Magento exposes stock through the `products` query (`stock_status`,
   * `only_x_left_in_stock`); source-level operations use the MSI GraphQL
   * entities. All mapping happens here so the layer composable can blindly
   * trust the interface.
   */
  private async fetchProductStock(identifier: { sku?: string; id?: string }): Promise<RawMagentoInventory | null> {
    const filter = identifier.sku
      ? { sku: { eq: identifier.sku } }
      : { ids: { eq: identifier.id } }

    const query = `
      query GetProductStock($filter: ProductFilterInput!) {
        products(filter: $filter) {
          items {
            sku
            stock_status
            only_x_left_in_stock
          }
        }
      }
    `

    const data = await this.client.request<{
      products: { items: Array<{ sku: string; stock_status: string; only_x_left_in_stock: number | null }> }
    }>(query, { filter })

    const item = data?.products?.items?.[0]
    if (!item) return null

    return {
      sku: item.sku,
      qty: item.only_x_left_in_stock ?? 0,
      is_in_stock: item.stock_status === 'IN_STOCK',
    }
  }

  private toSfStockItem(raw: RawMagentoInventory | null): any {
    if (!raw) return null
    const qty = typeof raw.qty === 'number' ? raw.qty : 0
    return {
      itemId: raw.sku,
      productId: raw.sku,
      sku: raw.sku,
      stockId: '1',
      qty,
      minQty: 0,
      isInStock: raw.is_in_stock ?? qty > 0,
      backorders: 0,
      minSaleQty: 1,
      maxSaleQty: 10000,
      notifyStockQty: 1,
      websiteId: '1',
      stockStatus: raw.is_in_stock ? 'in_stock' : 'out_of_stock',
      lowStockDate: undefined,
      enableQtyIncrements: false,
      qtyIncrements: 1,
      isQtyDecimal: false,
      useConfigMinQty: true,
      useConfigNotifyStockQty: true,
      useConfigBackorders: true,
      useConfigMinSaleQty: true,
      useConfigMaxSaleQty: true,
      useConfigEnableQtyIncrements: true,
      extensionAttributes: {},
      metadata: {},
    }
  }

  async checkInventory(sku: string, qty: number): Promise<boolean> {
    const stock = await this.fetchProductStock({ sku })
    return !!stock && (stock.qty ?? 0) >= qty
  }

  async getStockBySku(sku: string): Promise<any> {
    return this.toSfStockItem(await this.fetchProductStock({ sku }))
  }

  async getStockByProductId(productId: string): Promise<any> {
    return this.toSfStockItem(await this.fetchProductStock({ id: productId }))
  }

  async listInventorySources(): Promise<any[]> {
    const data = await this.store.readEntity('InventorySource', {}, { fields: ['code', 'name', 'enabled', 'type'] })
    const sources = Array.isArray(data) ? data : (data?.items ?? [])
    return sources.map((source: any) => ({
      id: source.code,
      code: source.code,
      name: source.name,
      enabled: source.enabled ?? true,
      type: source.type ?? 'default',
    }))
  }

  async listInventorySourceItems(params: { sourceCode: string; skus: string[] }): Promise<any[]> {
    const data = await this.store.readEntity('SourceItem', {
      source_code: params.sourceCode,
      skus: params.skus,
    }, { fields: ['sku', 'source_code', 'quantity', 'status'] })
    const items = Array.isArray(data) ? data : (data?.items ?? [])
    return items.map((item: any) => ({
      productId: item.sku,
      sku: item.sku,
      sourceId: item.source_code,
      qty: typeof item.quantity === 'number' ? item.quantity : 0,
      minQty: 0,
      useConfigMinQty: true,
      isQtyDecimal: false,
      backorders: 0,
      minSaleQty: 1,
      maxSaleQty: 10000,
      isInStock: item.status === 1,
      notifyStockQty: 1,
    }))
  }

  async assignStockToSource(payload: { sourceCode: string; sku: string; qty: number; status?: number }): Promise<any> {
    return await this.store.readEntity('SourceItem', {
      source_code: payload.sourceCode,
      sku: payload.sku,
      quantity: payload.qty,
      status: payload.status ?? 1,
    }, { fields: ['sku', 'source_code', 'quantity', 'status'] })
  }

  constructor(endpoint: string, storeCode?: string, customerToken?: string) {
    this.client = new GraphQLClient(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...(storeCode ? { 'Store': storeCode } : {}),
        ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {})
      },
    })
  }

  private async fetchRawMagentoData(id: string | number, fields: any[] = []): Promise<any> {
    const selectionString = this.parseFieldsToQuery(fields)
    const query = `
      query GetMagentoItem {
        product(id: "${id}") {
          ${selectionString}
        }
      }
    `
    const data = await this.client.request<Record<string, any>>(query)
    return data?.product
  }

  /**
   * Translates alternative fields matrices into clean inline GraphQL properties
   */
  private parseFieldsToQuery(fields: any[]): string {
    if (!Array.isArray(fields)) return 'sku'
    
    return fields.map(field => {
      if (typeof field === 'string') {
        return field === '*' ? 'sku' : field 
      }
      if (typeof field === 'object') {
        return Object.entries(field).map(([key, nestedFields]) => {
          return `${key} { \n ${this.parseFieldsToQuery(nestedFields as any[])} \n }`
        }).join('\n')
      }
      return ''
    }).join('\n')
  }

  /**
   * Helper to convert JS configuration objects directly into inline query arguments
   */
  private serializeArguments(args: Record<string, any>): string {
    return Object.entries(args)
      .map(([key, val]) => `${key}: ${JSON.stringify(val).replace(/"([^"]+)":/g, '$1:')}`)
      .join(', ')
  }
}