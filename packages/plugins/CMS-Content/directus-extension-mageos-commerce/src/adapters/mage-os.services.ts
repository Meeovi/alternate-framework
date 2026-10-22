import { randomBytes } from 'node:crypto'
import type { ICommerceAdapter } from './base.adapter'
import type {
  AdminCollection, BackendSeller, NormalizedProduct, ProductQueryOptions, ProductReview, ReviewRatingMetadata, SearchOptions,
  SearchResult, StoreConfig,
} from '../types'
import { CommerceError } from '../errors'
import {
  CATEGORY_BY_SLUG_QUERY, CREATE_CUSTOMER_MUTATION, CREATE_REVIEW_MUTATION, CUSTOMER_TOKEN_MUTATION, PRODUCT_REVIEWS_QUERY,
  REVIEW_RATINGS_QUERY, SEARCH_QUERY, STORE_CONFIG_QUERY, SUGGEST_QUERY,
} from './mage-os.queries'
import {
  ADMIN_SCHEMAS, creditMemoRow, customerRow, type MagentoCustomerOrder, orderRow, pickCustomer, searchCriteria, toAdminOrder,
  toBackendOrder, toGiftCard,
} from './mage-os.mappers'
import type { RawProduct } from './mage-os.adapter'

/**
 * Everything beyond the catalog, for Mage-OS: the working functionality of
 * adapter-magento (search, reviews, store config, customers, paid orders,
 * gift cards, Webkul sellers, catalogue sync, store admin), on the same
 * Magento routes. REST calls use the integration (MAGEOS_TOKEN + OAuth
 * credentials) unless noted; the Mage-OS modules each group needs are named.
 */
export interface MageOsTransport {
  graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T>
  rest<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, options?: { body?: unknown, allowNotFound?: boolean, auth?: 'integration' | { bearer: string } }): Promise<T>
}

type Normalize = (product: RawProduct) => NormalizedProduct
type Variables = (params: ProductQueryOptions) => Record<string, unknown>

/** Ids sent to Magento's REST routes are positive integers. */
function id(value: string, what = 'id'): number {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) throw new CommerceError('INVALID_QUERY', `Invalid ${what}`)
  return n
}

export function createMageOsServices(api: MageOsTransport, normalize: Normalize, variables: Variables, products: (skus: string[]) => Promise<NormalizedProduct[]>) {
  const search = async (options: SearchOptions): Promise<SearchResult> => {
    const vars = variables({ search: options.query, categoryId: options.categoryId, page: options.page, pageSize: options.pageSize, sort: options.sort })
    const data = await api.graphql<{ products: { total_count: number, page_info?: { current_page: number, page_size: number, total_pages: number }, items: RawProduct[], aggregations?: { attribute_code: string, label: string, options: { label: string, value: string, count: number }[] }[] } }>(
      SEARCH_QUERY, { ...vars, search: options.query, facets: !!options.facets })
    const p = data.products
    return {
      items: (p.items ?? []).filter(Boolean).map(normalize),
      page: p.page_info?.current_page ?? (vars.currentPage as number),
      pageSize: p.page_info?.page_size ?? (vars.pageSize as number),
      total: p.total_count ?? 0,
      totalPages: p.page_info?.total_pages ?? 0,
      facets: (p.aggregations ?? []).map((a) => ({ code: a.attribute_code, label: a.label, options: a.options ?? [] })),
    }
  }

  const suggest = async (query: string): Promise<string[]> => {
    const data = await api.graphql<{ products: { items: { name: string }[] } }>(SUGGEST_QUERY, { search: query })
    return [...new Set((data.products.items ?? []).map((item) => item?.name).filter(Boolean))]
  }

  const getStoreConfig = async (): Promise<StoreConfig> => {
    const { storeConfig: c } = await api.graphql<{ storeConfig: Record<string, any> }>(STORE_CONFIG_QUERY)
    return {
      storeCode: c.store_code,
      storeName: c.store_name,
      baseCurrency: c.base_currency_code,
      displayCurrency: c.default_display_currency_code,
      locale: c.locale,
      mediaUrl: c.base_media_url,
      copyright: c.copyright ?? null,
      reviewsEnabled: c.product_reviews_enabled === '1' || c.product_reviews_enabled === true,
      guestReviewsAllowed: c.allow_guests_to_write_product_reviews === '1' || c.allow_guests_to_write_product_reviews === true,
    }
  }

  const resolveCategoryId = async (slug: string): Promise<string | null> => {
    const data = await api.graphql<{ categories: { items: { uid: string }[] } }>(CATEGORY_BY_SLUG_QUERY, { slug })
    return data.categories.items?.[0]?.uid ?? null
  }

  const toReview = (r: any): ProductReview => ({
    nickname: r.nickname,
    summary: r.summary,
    text: r.text,
    createdAt: r.created_at ? new Date(`${String(r.created_at).replace(' ', 'T')}Z`).toISOString() : '',
    averageRating: Number(r.average_rating) || 0,
    ratings: (r.ratings_breakdown ?? []).map((b: any) => ({ name: b.name, value: String(b.value) })),
  })

  const reviews: NonNullable<ICommerceAdapter['reviews']> = {
    async list(sku, pageSize) {
      const data = await api.graphql<{ products: { items: { reviews?: { items: any[] } }[] } }>(PRODUCT_REVIEWS_QUERY, { sku, pageSize })
      return (data.products.items?.[0]?.reviews?.items ?? []).map(toReview)
    },
    async ratings(): Promise<ReviewRatingMetadata[]> {
      const data = await api.graphql<{ productReviewRatingsMetadata: { items: { id: string, name: string, values: { value_id: string, value: string }[] }[] } }>(REVIEW_RATINGS_QUERY)
      return (data.productReviewRatingsMetadata.items ?? []).map((r) => ({ id: r.id, name: r.name, values: r.values.map((v) => ({ id: v.value_id, value: v.value })) }))
    },
    async create(sku, input) {
      const data = await api.graphql<{ createProductReview: { review: any } }>(CREATE_REVIEW_MUTATION, {
        input: { sku, nickname: input.nickname, summary: input.summary, text: input.text, ratings: input.ratings.map((r) => ({ id: r.id, value_id: r.valueId })) },
      })
      return toReview(data.createProductReview.review)
    },
  }

  const sellers: NonNullable<ICommerceAdapter['sellers']> = {
    // Needs Meeovi_MarketplaceApi. Store-owned SKUs are left out.
    async forSkus(skus) {
      const wanted = [...new Set(skus.filter(Boolean))].slice(0, 100)
      if (!wanted.length) return {}
      const query = new URLSearchParams()
      wanted.forEach((sku, i) => query.set(`skus[${i}]`, sku))
      const rows = await api.rest<{ sku: string, seller_id: number, shop_title: string | null, shop_url: string | null }[]>('GET', `/V1/meeovi-marketplace/products/sellers?${query}`)
      return Object.fromEntries((rows ?? []).map((row): [string, BackendSeller] => [row.sku, { customerId: String(row.seller_id), name: row.shop_title?.trim() || null, shopUrl: row.shop_url || null }]))
    },
    async register(customerId, customerToken, shopUrl) {
      return await api.rest('POST', '/V1/meeovi-marketplace/seller/register', {
        auth: { bearer: customerToken },
        body: shopUrl ? { customerId: id(customerId, 'customerId'), shopUrl } : { customerId: id(customerId, 'customerId') },
      })
    },
    async createProduct(customerId, customerToken, input) {
      return await api.rest('POST', '/V1/meeovi-marketplace/seller/products', {
        auth: { bearer: customerToken },
        body: { customerId: id(customerId, 'customerId'), ...input },
      })
    },
    // The dashboard routes below are read with the integration on the
    // seller's behalf (the app never has a seller's Magento password).
    shop: async (customerId) => api.rest('GET', `/V1/meeovi-marketplace/seller/shop?customerId=${id(customerId, 'customerId')}`, { allowNotFound: true }),
    updateShop: async (customerId, updates) => api.rest('PUT', '/V1/meeovi-marketplace/seller/shop', { body: { ...updates, customerId: id(customerId, 'customerId') } }),
    products: async (customerId) => (await api.rest<unknown[]>('GET', `/V1/meeovi-marketplace/seller/products/list?customerId=${id(customerId, 'customerId')}`)) ?? [],
    orders: async (customerId) => (await api.rest<unknown[]>('GET', `/V1/meeovi-marketplace/seller/orders?customerId=${id(customerId, 'customerId')}`)) ?? [],
    transactions: async (customerId) => (await api.rest<unknown[]>('GET', `/V1/meeovi-marketplace/seller/transactions?customerId=${id(customerId, 'customerId')}`)) ?? [],
    lowStock: async (customerId) => (await api.rest<unknown[]>('GET', `/V1/meeovi-marketplace/seller/low-stock?customerId=${id(customerId, 'customerId')}`)) ?? [],
  }

  const customers: NonNullable<ICommerceAdapter['customers']> = {
    /**
     * A Magento customer as an order/scope anchor for a user who signed in
     * elsewhere: the password is random and never returned (nobody logs in
     * to Magento with it). The numeric id isn't exposed over GraphQL, so it's
     * read from a freshly minted customer token's JWT (`uid`), which also
     * authorizes the optional, best-effort seller registration.
     */
    async create(input) {
      const password = `${randomBytes(18).toString('base64url')}Aa1!`
      const created = await api.graphql<{ createCustomerV2: { customer: { email: string, firstname: string, lastname: string } } }>(CREATE_CUSTOMER_MUTATION, {
        input: { firstname: input.firstname, lastname: input.lastname, email: input.email, password },
      })
      const customer = created.createCustomerV2.customer
      let customerId: string | null = null
      let token: string | null = null
      try {
        const minted = await api.graphql<{ generateCustomerToken: { token: string } }>(CUSTOMER_TOKEN_MUTATION, { email: input.email, password })
        token = minted.generateCustomerToken.token
        const payload = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8')) as { uid?: number | string }
        if (payload.uid) customerId = String(payload.uid)
      } catch {
        // No id this time; the customer still exists.
      }
      let seller: { isApproved: boolean, shopUrl: string } | null = null
      if (input.wantsToSell && customerId && token) {
        try {
          const registered = await sellers.register(customerId, token)
          seller = { isApproved: !!registered.isApproved, shopUrl: registered.shopUrl }
        } catch {
          // Best effort, like adapter-magento: the signup itself succeeded.
        }
      }
      return { id: customerId, email: customer.email, firstname: customer.firstname, lastname: customer.lastname, seller }
    },
  }

  const orders: NonNullable<ICommerceAdapter['orders']> = {
    // Meeovi_MarketplaceApi ExternalOrderManagement (ACL Meeovi_MarketplaceApi::external_orders).
    async placePaid(order) {
      const placed = await api.rest<{ order_id: number, increment_id: string, created: boolean }>('POST', '/V1/meeovi-marketplace/orders', {
        body: {
          customerId: id(order.customerId, 'customerId'),
          reference: order.reference,
          items: order.items.map((item) => ({ sku: String(item.key), qty: item.qty })),
          amountPaid: order.amountPaid,
          currency: order.currency.toUpperCase(),
          ...(order.billingAddress ? { billingAddress: order.billingAddress } : {}),
        },
      })
      return { id: String(placed.order_id), number: placed.increment_id, created: !!placed.created }
    },
    async forCustomer(customerId, page, pageSize) {
      const rows = await api.rest<MagentoCustomerOrder[]>('GET', `/V1/meeovi-marketplace/customers/${id(customerId, 'customerId')}/orders?pageSize=${pageSize}&currentPage=${page}`)
      return (rows ?? []).map(toBackendOrder)
    },
    async oneForCustomer(customerId, orderId) {
      if (!/^\d+$/.test(orderId)) return null
      const row = await api.rest<MagentoCustomerOrder | null>('GET', `/V1/meeovi-marketplace/customers/${id(customerId, 'customerId')}/orders/${id(orderId, 'orderId')}`, { allowNotFound: true })
      return row ? toBackendOrder(row) : null
    },
    purchasedSkus: async (customerId) => (await api.rest<string[]>('GET', `/V1/meeovi-marketplace/customers/${id(customerId, 'customerId')}/purchased-skus`)) ?? [],
  }

  // Meeovi_GiftCards (ACL Meeovi_GiftCards::read).
  const giftCards: NonNullable<ICommerceAdapter['giftCards']> = {
    async products() {
      const skus = ((await api.rest<string[]>('GET', '/V1/meeovi-giftcards/products')) ?? []).slice(0, 100)
      return skus.length ? products(skus) : []
    },
    received: async (email) => ((await api.rest<any[]>('GET', `/V1/meeovi-giftcards/received?email=${encodeURIComponent(email)}`)) ?? []).map(toGiftCard),
    purchased: async (customerId) => ((await api.rest<any[]>('GET', `/V1/meeovi-giftcards/customers/${id(customerId, 'customerId')}/purchased`)) ?? []).map(toGiftCard),
  }

  // Meeovi_MarketplaceApi sync routes + core order/shipment REST; the module refuses SKUs not linked to the seller.
  const catalogSync: NonNullable<ICommerceAdapter['catalogSync']> = {
    upsertProduct: (input) => api.rest('POST', '/V1/meeovi-marketplace/sync/products', { body: input }),
    updateStock: (input) => api.rest('POST', '/V1/meeovi-marketplace/sync/stock', { body: input }),
    addImage: (input) => api.rest('POST', '/V1/meeovi-marketplace/sync/images', { body: input }),
    listOrders: (filters, pageSize) => api.rest('GET', `/V1/orders?${searchCriteria(filters, pageSize)}`),
    shipOrder: (orderId, shipment) => api.rest('POST', `/V1/order/${id(orderId, 'orderId')}/ship`, { body: shipment }),
  }

  // Core REST. Integration ACL: Magento_Customer::customer/::manage/::delete,
  // Magento_Sales::actions_view, ::sales_creditmemo, ::creditmemo.
  const fetchOrder = (orderId: string) => api.rest<any | null>('GET', `/V1/orders/${id(orderId, 'orderId')}`, { allowNotFound: true })
  const admin: NonNullable<ICommerceAdapter['admin']> = {
    async list(collection: AdminCollection) {
      if (collection === 'customers') return (await api.rest<{ items: any[] }>('GET', `/V1/customers/search?${searchCriteria([], 500)}`)).items.map(customerRow)
      if (collection === 'orders') return (await api.rest<{ items: any[] }>('GET', `/V1/orders?${searchCriteria([], 200)}`)).items.map(orderRow)
      return (await api.rest<{ items: any[] }>('GET', `/V1/creditmemos?${searchCriteria([], 200)}`)).items.map(creditMemoRow)
    },
    schema: (collection) => ADMIN_SCHEMAS[collection],
    async createCustomer(data) {
      return customerRow(await api.rest('POST', '/V1/customers', { body: { customer: { ...pickCustomer(data), website_id: Number(data.website_id ?? 1) || 1 } } }))
    },
    async updateCustomer(customerId, data) {
      const n = id(customerId)
      // Magento's PUT replaces the record: merge onto the current one.
      const current = await api.rest<Record<string, unknown> | null>('GET', `/V1/customers/${n}`, { allowNotFound: true })
      if (!current) throw new CommerceError('NOT_FOUND', 'Customer not found')
      return customerRow(await api.rest('PUT', `/V1/customers/${n}`, { body: { customer: { ...current, ...pickCustomer(data), id: n } } }))
    },
    async deleteCustomer(customerId) {
      await api.rest('DELETE', `/V1/customers/${id(customerId)}`)
    },
    async order(orderId) {
      if (!/^\d+$/.test(orderId)) return null
      const order = await fetchOrder(orderId)
      return order ? toAdminOrder(order) : null
    },
    async orderByReference(reference) {
      const { items } = await api.rest<{ items: any[] }>('GET', `/V1/orders?${searchCriteria([{ field: 'ext_order_id', value: reference }], 1)}`)
      return items?.[0] ? toAdminOrder(items[0]) : null
    },
    async refund(refund) {
      const order = await fetchOrder(refund.orderId)
      if (!order) throw new CommerceError('NOT_FOUND', 'Order not found')
      const refundable = toAdminOrder(order).refundable
      const wanted = refund.items?.length ? refund.items : refundable.map((line) => ({ key: line.key, qty: line.qty }))
      if (!wanted.length) throw new CommerceError('REJECTED', 'Nothing left to refund on this order')
      for (const item of wanted) {
        const line = refundable.find((l) => l.key === String(item.key))
        if (!line || !(item.qty > 0) || item.qty > line.qty) throw new CommerceError('INVALID_QUERY', `Line ${item.key} can't be refunded ${item.qty}×`)
      }
      // An offline credit memo: no payment gateway call (the app refunds the payment itself).
      const memo = await api.rest<number>('POST', `/V1/order/${Number(order.entity_id)}/refund`, {
        body: {
          items: wanted.map((item) => ({ order_item_id: Number(item.key), qty: item.qty })),
          notify: false,
          ...(refund.comment ? { comment: { comment: refund.comment, is_visible_on_front: 0 } } : {}),
          arguments: { shipping_amount: 0, adjustment_positive: 0, adjustment_negative: 0 },
        },
      })
      return { creditMemoId: String(memo) }
    },
  }

  return { search, suggest, getStoreConfig, resolveCategoryId, reviews, customers, orders, giftCards, sellers, catalogSync, admin }
}
