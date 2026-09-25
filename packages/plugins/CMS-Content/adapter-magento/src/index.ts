// packages/plugins/CMS-Content/adapter-magento/src/index.ts
import { GraphQLClient } from 'graphql-request'
import type { Query } from './graphql/schema-types' // Generated via mesh-compose types
import { normalizeProductToPage } from './normalizers/normalizers'
import type { RawMagentoInventory } from './normalizers/inventory'

/**
 * Magento's "Integration" admin credentials (Admin > System > Extensions >
 * Integrations) are OAuth 1.0a — a consumer key/secret plus an access
 * token/secret that don't expire, not a simple bearer token. Every
 * `seller.*` admin-scoped call below signs its request with these per the
 * OAuth 1.0a spec (HMAC-SHA1) rather than sending them as `Bearer ...`.
 */
export interface MagentoOAuth1Credentials {
  consumerKey: string
  consumerSecret: string
  accessToken: string
  accessTokenSecret: string
}

function rfc3986Encode(value: string): string {
  return encodeURIComponent(value).replace(/[!*'()]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
}

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
    search: async (query: string, options?: {
      pageSize?: number
      /** Magento's own 1-indexed page argument — same convention as
       *  layers/search's SearchProviderOptions.page, no off-by-one to fix. */
      currentPage?: number
      /** Raw ProductAttributeFilterInput shape, e.g.
       *  { category_uid: { in: ['10','11'] } } — passed straight through,
       *  not translated here (the caller owns the attribute-code mapping). */
      filter?: Record<string, any>
      /** Keys must be one of ProductAttributeSortInput's fields (name,
       *  position, price, relevance) — that's the full set Magento's schema
       *  exposes, there is no arbitrary-field sort. */
      sort?: Record<string, 'ASC' | 'DESC'>
      /** Also requests layered-navigation aggregations (facet buckets) on
       *  the response when true. */
      aggregations?: boolean
      fields?: any[]
    }) => {
      // `price` is not a scalar on ProductInterface (confirmed live) — only
      // `price_range` (an object) exists, hence the default field shape below.
      const defaultFields = ['sku', 'name', { price_range: [{ minimum_price: [{ final_price: ['value'] }] }] }]

      const args: Record<string, any> = {
        search: query,
        pageSize: options?.pageSize || 20,
      }
      if (options?.currentPage) args.currentPage = options.currentPage
      if (options?.filter && Object.keys(options.filter).length) args.filter = options.filter
      if (options?.sort && Object.keys(options.sort).length) {
        args.sort = Object.fromEntries(
          Object.entries(options.sort).map(([field, direction]) => [field, this.rawGraphQLEnum(direction)]),
        )
      }

      const resultFields: any[] = [{ items: options?.fields || defaultFields }, 'total_count']
      if (options?.aggregations) {
        resultFields.push({ aggregations: ['attribute_code', 'label', { options: ['label', 'value', 'count'] }] })
      }

      const result = await this.store.queryField('products', args, { fields: resultFields })
      // total_count was already being queried here but discarded — callers
      // that need the real match count (not just this page's item count,
      // e.g. layers/search's federated pagination) had no way to get it.
      return {
        items: result?.items ?? [],
        total: result?.total_count ?? (result?.items?.length ?? 0),
        aggregations: result?.aggregations ?? [],
      }
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
    /**
     * Confirmed live that `store.readEntity('Product', ...)` (this method's
     * previous implementation) always throws: it guesses a singular root
     * field (`Mage_Product`/`Product`/`product`), but the real storefront
     * schema only exposes the plural, search-style `products(...)` field —
     * same fix as `getProductReviews`/`getStoreConfig` above, via
     * `store.queryField`. `search: ''` (rather than omitting it) matches
     * `content.search`, the one product-reading path already proven live.
     */
    getProducts: async (params?: Record<string, any>) => {
      const fields = params?.fields || ['sku', 'name', { price_range: [{ minimum_price: [{ final_price: ['value', 'currency'] }] }] }]
      const args: Record<string, any> = { search: '', pageSize: params?.pageSize || 20 }
      if (params?.filter && Object.keys(params.filter).length) args.filter = params.filter
      if (params?.currentPage) args.currentPage = params.currentPage

      const result = await this.store.queryField('products', args, { fields: [{ items: fields }, 'total_count'] })
      return result?.items ?? []
    },

    /**
     * Magento's public storefront schema has no `entity_id`/`id` filter on
     * `products` — `sku` is the only reliable single-product lookup key.
     * `id` here is treated as a sku (same lookup `getProductBySku` does);
     * this is a behavior change from the old `readEntity('Product', {id})`
     * call, which never actually returned real data to change from.
     */
    getProductById: async (id: string) => {
      return await this.commerce.getProductBySku(id)
    },

    getProductBySku: async (sku: string) => {
      const result = await this.store.queryField('products', { filter: { sku: { eq: sku } }, pageSize: 1 }, {
        fields: [{ items: ['sku', 'name', { price_range: [{ minimum_price: [{ final_price: ['value', 'currency'] }] }] }] }],
      })
      return result?.items?.[0] ?? null
    },

    getProductBySlug: async (slug: string) => {
      const result = await this.store.queryField('products', { filter: { url_key: { eq: slug } }, pageSize: 1 }, {
        fields: [{ items: ['sku', 'name', 'url_key', { price_range: [{ minimum_price: [{ final_price: ['value', 'currency'] }] }] }] }],
      })
      return result?.items?.[0] ?? null
    },

    /**
     * Reads a product's reviews straight off Magento's `products` root
     * field (there is no standalone `productReviews` query) — same
     * `reviews { items { ... } }` shape productsListQuery already
     * requests, just scoped to one SKU and without the rest of the
     * catalog fields.
     */
    getProductReviews: async (sku: string, pageSize = 20) => {
      const data = await this.store.queryField('products', { filter: { sku: { eq: sku } }, pageSize }, {
        fields: [{
          items: [
            'sku',
            'review_count',
            {
              reviews: [
                'average_rating',
                { items: ['nickname', 'summary', 'text', 'created_at', 'average_rating'] },
              ],
            },
          ],
        }],
      })
      return data?.items?.[0]?.reviews?.items ?? []
    },

    /**
     * Submits a product review via Magento's `createProductReview`
     * mutation. Whether this requires a signed-in customer depends on the
     * store's `allow_guests_to_write_product_reviews` config (see
     * `getStoreConfig`) — this adapter doesn't enforce that itself, it
     * just forwards whatever token the caller constructed it with.
     */
    createProductReview: async (input: {
      sku: string
      nickname: string
      summary: string
      text: string
      ratings: Array<{ id: string; value_id: string }>
    }) => {
      return await this.store.mutateEntity('createProductReview', { input }, {
        fields: [{ review: ['nickname', 'summary', 'text', { average_rating: [] }] }],
      })
    },

    /**
     * General store/shop info — name, currency, locale, media base URL.
     * Read-only, unauthenticated; safe to call against a live storefront
     * in tests.
     */
    getStoreConfig: async () => {
      return await this.store.queryField('storeConfig', {}, {
        fields: [
          'store_code', 'store_name', 'base_currency_code', 'default_display_currency_code',
          'locale', 'base_media_url', 'copyright', 'product_reviews_enabled',
          'allow_guests_to_write_product_reviews',
        ],
      })
    },

    /**
     * Same `readEntity` guessing bug as products, fixed the same way —
     * real Magento exposes a plural `categories(filters: CategoryFilterInput, ...)`
     * field, not a singular `Category`/`Mage_Category`. Field names also
     * corrected: Magento's schema has `url_key` (a category has no
     * `slug` attribute), which the old defaults were silently requesting
     * as a non-existent field — never reached, since `readEntity` always
     * threw before a query was even attempted, but worth fixing alongside
     * so this doesn't throw for a different reason once queryField makes
     * the request for real. `filters` is only included when non-empty —
     * unlike `products`, an explicitly empty `filters: {}` argument isn't
     * confirmed safe against every Magento version (omitting it is the
     * documented way to get the root category tree).
     */
    getCategories: async (params?: Record<string, any>) => {
      const fields = params?.fields || ['id', 'name', 'url_key']
      const args: Record<string, any> = { pageSize: params?.pageSize || 20 }
      if (params?.filter && Object.keys(params.filter).length) args.filters = params.filter

      const result = await this.store.queryField('categories', args, { fields: [{ items: fields }, 'total_count'] })
      return result?.items ?? []
    },

    getCategory: async (id: string) => {
      const result = await this.store.queryField('categories', { filters: { ids: { eq: String(id) } }, pageSize: 1 }, {
        fields: [{ items: ['id', 'name', 'url_key'] }],
      })
      return result?.items?.[0] ?? null
    },

    getCategoryTree: async (params?: Record<string, any>) => {
      const fields = params?.fields || ['id', 'name', 'url_key', { children: ['id', 'name', 'url_key'] }]
      const args: Record<string, any> = { pageSize: params?.pageSize || 20 }
      if (params?.filter && Object.keys(params.filter).length) args.filters = params.filter

      const result = await this.store.queryField('categories', args, { fields: [{ items: fields }] })
      return result?.items ?? []
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
     *
     * `wantsToSell` additionally registers the new customer as a Webkul
     * Multi Vendor Marketplace seller via Meeovi_MarketplaceApi's
     * `POST /V1/meeovi-marketplace/seller/register` (self-scoped — needs
     * that same customer token, so it's minted unconditionally here rather
     * than only on the id-recovery fallback path). Best-effort: like the
     * id-recovery above, a failure here still returns the created customer
     * rather than failing the whole signup — the caller (commerce-link.ts)
     * already treats this the same way it treats an unreachable backend.
     */
    createCustomer: async (payload: { firstname: string; lastname: string; email: string; wantsToSell?: boolean }) => {
      const password = `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}Aa1!`
      const data = await this.store.mutateEntity('createCustomerV2', {
        input: { firstname: payload.firstname, lastname: payload.lastname, email: payload.email, password },
      }, { fields: [{ customer: ['id', 'email', 'firstname', 'lastname'] }] })
      const customer = data?.customer
      if (!customer) return null

      let uid: number | null = customer.id ? Number(customer.id) : null
      let token: string | null = null

      if (!uid || payload.wantsToSell) {
        try {
          const tokenData = await this.store.mutateEntity('generateCustomerToken', {
            email: payload.email,
            password,
          }, { fields: ['token'] })
          token = tokenData?.token ?? null
          if (!uid && token) {
            const payloadJson = Buffer.from(token.split('.')[1], 'base64').toString('utf8')
            const recoveredUid = JSON.parse(payloadJson)?.uid
            if (recoveredUid) uid = Number(recoveredUid)
          }
        } catch {
          // Id recovery / token mint failing shouldn't fail the whole
          // signup — the caller just won't get a linkable id (or seller
          // registration) this time.
        }
      }

      if (payload.wantsToSell && uid && token) {
        try {
          const result = await this.seller.registerSeller(uid, token)
          if (!result) {
            console.error('[adapter-magento] Seller registration rejected for new customer', uid)
          }
        } catch (e) {
          console.error('[adapter-magento] Seller registration failed for new customer', uid, e)
        }
      }

      return uid ? { ...customer, id: uid } : customer
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

    // `price` is not a scalar on ProductInterface (confirmed live, see
    // content.search above) — only `price_range` (an object) exists, same
    // fix as getProductBySku/getProducts.
    getCatalogPriceBySku: async (sku: string) => {
      const result = await this.store.queryField('products', { filter: { sku: { eq: sku } }, pageSize: 1 }, {
        fields: [{ items: ['sku', { price_range: [{ minimum_price: [{ final_price: ['value', 'currency'] }] }] }] }],
      })
      return result?.items?.[0] ?? null
    },

    getCatalogPriceForProduct: async (productId: string) => {
      return await this.commerce.getCatalogPriceBySku(productId)
    },

    // Unlike the sku/id lookups above, MAP (minimum advertised price) and
    // MSRP aren't queryable fields on Magento's public storefront schema —
    // they're admin/catalog-price-rule concepts with no confirmed GraphQL
    // equivalent. Left unfixed rather than guessing a schema shape I can't
    // verify; still broken the same way it was before.
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
   * Webkul Multi Vendor Marketplace seller operations, bridged through the
   * custom `Meeovi_MarketplaceApi` REST module (no GraphQL surface exists
   * for these — see `restUrl`). Both calls are self-scoped: the customer
   * token passed in must belong to the customer being registered/creating
   * the product, the same way `commerce.createCustomer`'s inline seller
   * registration always has.
   */
  public seller = {
    /**
     * Registers an existing Magento customer as a marketplace seller.
     * Extracted out of `commerce.createCustomer` (which still calls this)
     * so it's independently callable/testable — e.g. for an already-
     * existing customer who decides to start selling later, not only at
     * signup time.
     */
    registerSeller: async (customerId: number, customerToken: string, shopUrl?: string): Promise<{
      sellerRecordId: number
      isApproved: boolean
      shopUrl: string
    } | null> => {
      const response = await fetch(this.restUrl('/meeovi-marketplace/seller/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify(shopUrl ? { customerId, shopUrl } : { customerId }),
      })
      if (!response.ok) return null
      return await response.json()
    },

    /**
     * Creates a product under an already-registered seller's marketplace
     * shop. No caller existed anywhere in this repo for
     * `POST /meeovi-marketplace/seller/products` before this — the PHP
     * endpoint (`SellerProductManagementInterface::createProduct`) was
     * live but unreachable from any TypeScript code path.
     */
    createProduct: async (customerId: number, customerToken: string, input: {
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
    }): Promise<{
      productId: number
      sku: string
      marketplaceProductId: number
    } | null> => {
      const response = await fetch(this.restUrl('/meeovi-marketplace/seller/products'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({ customerId, ...input }),
      })
      if (!response.ok) return null
      return await response.json()
    },

    /**
     * The 6 `SellerDashboardManagementInterface` routes — unlike
     * registerSeller/createProduct above (customer-token-scoped), these
     * are called with an ADMIN Integration so a trusted server backend can
     * read any seller's dashboard data on their behalf without needing
     * that seller's own Magento password (which this app never has — see
     * `commerce.createCustomer`'s throwaway-password comment). Magento's
     * `self` resource bypasses its own scoping check entirely for admin
     * credentials (same behavior the existing module README documents),
     * which is what makes this legitimate rather than a bypass.
     *
     * Every PHP method returns a JSON-*encoded string*, not a native
     * array/object (see the PHP interface's own docblock for why) — so
     * Magento's REST layer serializes that string as a JSON string
     * literal, and each call here needs an extra `JSON.parse()` on top of
     * the normal `response.json()` to reach the real value.
     */
    getShopProfile: async (customerId: number, credentials: MagentoOAuth1Credentials): Promise<Record<string, any> | null> => {
      const url = `${this.restUrl('/meeovi-marketplace/seller/shop')}?customerId=${customerId}`
      const response = await fetch(url, {
        headers: { Authorization: await this.oauth1Header('GET', url, credentials) },
      })
      if (!response.ok) return null
      return JSON.parse(await response.json())
    },

    updateShopProfile: async (customerId: number, credentials: MagentoOAuth1Credentials, updates: Record<string, any>): Promise<Record<string, any> | null> => {
      const url = this.restUrl('/meeovi-marketplace/seller/shop')
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: await this.oauth1Header('PUT', url, credentials),
        },
        body: JSON.stringify({ customerId, ...updates }),
      })
      if (!response.ok) return null
      return JSON.parse(await response.json())
    },

    getSellerProducts: async (customerId: number, credentials: MagentoOAuth1Credentials): Promise<any[]> => {
      const url = `${this.restUrl('/meeovi-marketplace/seller/products/list')}?customerId=${customerId}`
      const response = await fetch(url, {
        headers: { Authorization: await this.oauth1Header('GET', url, credentials) },
      })
      if (!response.ok) return []
      return JSON.parse(await response.json())
    },

    getSellerOrders: async (customerId: number, credentials: MagentoOAuth1Credentials): Promise<any[]> => {
      const url = `${this.restUrl('/meeovi-marketplace/seller/orders')}?customerId=${customerId}`
      const response = await fetch(url, {
        headers: { Authorization: await this.oauth1Header('GET', url, credentials) },
      })
      if (!response.ok) return []
      return JSON.parse(await response.json())
    },

    getSellerTransactions: async (customerId: number, credentials: MagentoOAuth1Credentials): Promise<any[]> => {
      const url = `${this.restUrl('/meeovi-marketplace/seller/transactions')}?customerId=${customerId}`
      const response = await fetch(url, {
        headers: { Authorization: await this.oauth1Header('GET', url, credentials) },
      })
      if (!response.ok) return []
      return JSON.parse(await response.json())
    },

    getLowStockProducts: async (customerId: number, credentials: MagentoOAuth1Credentials): Promise<any[]> => {
      const url = `${this.restUrl('/meeovi-marketplace/seller/low-stock')}?customerId=${customerId}`
      const response = await fetch(url, {
        headers: { Authorization: await this.oauth1Header('GET', url, credentials) },
      })
      if (!response.ok) return []
      return JSON.parse(await response.json())
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

  constructor(private endpoint: string, storeCode?: string, customerToken?: string) {
    this.client = new GraphQLClient(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...(storeCode ? { 'Store': storeCode } : {}),
        ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {})
      },
    })
  }

  /**
   * Derives the store's REST base ("https://host/graphql" ->
   * "https://host/rest/V1") from the GraphQL endpoint this adapter was
   * constructed with — used only by the Meeovi_MarketplaceApi bridge module
   * calls below, which has no GraphQL surface of its own.
   */
  private restUrl(path: string): string {
    return `${this.endpoint.replace(/\/graphql\/?$/, '')}/rest/V1${path}`
  }

  /**
   * Signs a request per OAuth 1.0a (HMAC-SHA1) using a Magento Integration's
   * consumer key/secret + access token/secret. Only query-string params are
   * folded into the signature base string alongside the oauth_* params —
   * these calls always send JSON bodies (not form-encoded), which OAuth 1.0a
   * excludes from signing.
   */
  private async oauth1Header(method: string, url: string, credentials: MagentoOAuth1Credentials): Promise<string> {
    // Dynamic, not a top-level `import ... from 'node:crypto'` — this
    // whole file also gets bundled for the CLIENT (via
    // runtime/plugin.ts's `new MagentoAdapter(...)`, registered as a
    // universal Nuxt plugin). A static top-level Node-builtin import
    // breaks that client bundle outright (Vite substitutes a stub with
    // none of the real named exports, throwing "does not provide an
    // export named 'createHmac'" the moment ANY code in this module
    // evaluates — which took out the whole client app, including Nuxt
    // DevTools' own mount — confirmed live 2026-09-16). This method is
    // only ever reached from the admin-only `seller.*` calls in
    // layers/business/server (Nitro-only), so the dynamic import is never
    // actually requested by the browser at all.
    const { createHmac, randomBytes } = await import('node:crypto')
    const { consumerKey, consumerSecret, accessToken, accessTokenSecret } = credentials
    const urlObj = new URL(url)
    const baseUrl = `${urlObj.origin}${urlObj.pathname}`

    const queryParams: Record<string, string> = {}
    urlObj.searchParams.forEach((value, key) => { queryParams[key] = value })

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: consumerKey,
      oauth_token: accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: String(Math.floor(Date.now() / 1000)),
      oauth_nonce: randomBytes(16).toString('hex'),
      oauth_version: '1.0',
    }

    const allParams = { ...queryParams, ...oauthParams }
    const normalizedParams = Object.keys(allParams)
      .sort()
      .map((key) => `${rfc3986Encode(key)}=${rfc3986Encode(allParams[key])}`)
      .join('&')

    const baseString = [method.toUpperCase(), rfc3986Encode(baseUrl), rfc3986Encode(normalizedParams)].join('&')
    const signingKey = `${rfc3986Encode(consumerSecret)}&${rfc3986Encode(accessTokenSecret)}`
    const signature = createHmac('sha1', signingKey).update(baseString).digest('base64')

    const headerParams = { ...oauthParams, oauth_signature: signature }
    const headerString = Object.keys(headerParams)
      .sort()
      .map((key) => `${rfc3986Encode(key)}="${rfc3986Encode(headerParams[key])}"`)
      .join(', ')

    return `OAuth ${headerString}`
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
      // rawGraphQLEnum() below marks enum values (e.g. SortEnum's ASC/DESC)
      // with a sentinel so they survive JSON.stringify as strings, then get
      // unquoted here — GraphQL enum arguments are bare identifiers, and
      // sending them as quoted strings is a schema validation error.
      .replace(/"ENUM:([^"]*)"/g, '$1')
  }

  /** See serializeArguments — wraps a value so it's emitted as a bare
   *  GraphQL enum identifier instead of a quoted string. */
  private rawGraphQLEnum(value: string): { toJSON(): string } {
    return { toJSON: () => `ENUM:${value}` }
  }
}