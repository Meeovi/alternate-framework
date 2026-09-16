import { sql } from 'drizzle-orm'
import { db } from '#auth/server/utils/drizzle'
import { MagentoAdapter } from 'adapter-magento'
import type { MagentoOAuth1Credentials } from 'adapter-magento'
import type {
  BusinessDriverContract,
  SellerListParams,
  SellerLowStockItem,
  SellerOrder,
  SellerProduct,
  SellerShopProfile,
  SellerTransaction
} from 'alternate-sdk/contracts'

/**
 * Real Webkul Multi Vendor Marketplace data for the 5 domains that map
 * cleanly onto Webkul's own tables (see
 * packages/adapters/adapter-magento/magento-module/Meeovi/MarketplaceApi's
 * `SellerDashboardManagementInterface` for the PHP side). Every other
 * `BusinessDriverContract` method delegates to `fallback` (normally
 * `DefaultBusinessAdapter`'s mock data) unchanged — reviews, shipments,
 * invoices, spaces, attributes, integrations, coupons, payouts,
 * featuredProducts, announcements, and getStats aren't in scope for this
 * adapter (no confirmed Webkul-native data source, or not yet built).
 *
 * The seller-dashboard REST routes are admin-scoped, not
 * customer-token-scoped (see MagentoAdapter.seller.getShopProfile's own
 * comment for why) — `credentials` is a Magento Integration's OAuth 1.0a
 * consumer key/secret + access token/secret (`MAGENTO_CONSUMER_KEY`,
 * `MAGENTO_CONSUMER_SECRET`, `MAGENTO_ACCESS_TOKEN`,
 * `MAGENTO_ACCESS_TOKEN_SECRET`), never exposed to the client. Resolving a
 * `sellerId` (this app's own better-auth user id) to the Magento customer
 * id these routes need goes through `users.magentoCustomerId`, populated
 * at signup by `commerce-link.ts`'s `CommerceCustomerLinkRegistry` hook.
 */
export class MagentoBusinessAdapter implements BusinessDriverContract {
  private magento: MagentoAdapter

  products: BusinessDriverContract['products']
  orders: BusinessDriverContract['orders']
  invoices: BusinessDriverContract['invoices']
  reviews: BusinessDriverContract['reviews']
  shipments: BusinessDriverContract['shipments']
  spaces: BusinessDriverContract['spaces']
  attributes: BusinessDriverContract['attributes']
  integrations: BusinessDriverContract['integrations']
  shop: BusinessDriverContract['shop']
  lowStock: BusinessDriverContract['lowStock']
  transactions: BusinessDriverContract['transactions']
  payouts: BusinessDriverContract['payouts']
  coupons: BusinessDriverContract['coupons']
  featuredProducts: BusinessDriverContract['featuredProducts']
  announcements: BusinessDriverContract['announcements']

  constructor(
    private fallback: BusinessDriverContract,
    endpoint: string,
    private credentials: MagentoOAuth1Credentials
  ) {
    this.magento = new MagentoAdapter(endpoint)

    // Delegate everything not implemented for real below, unchanged.
    this.invoices = fallback.invoices
    this.reviews = fallback.reviews
    this.shipments = fallback.shipments
    this.spaces = fallback.spaces
    this.attributes = fallback.attributes
    this.integrations = fallback.integrations
    this.payouts = fallback.payouts
    this.coupons = fallback.coupons
    this.featuredProducts = fallback.featuredProducts
    this.announcements = fallback.announcements

    this.products = {
      list: async (params) => {
        const customerId = await this.resolveMagentoCustomerId(params?.sellerId)
        if (!customerId) return fallback.products.list(params)
        const rows = await this.magento.seller.getSellerProducts(customerId, this.credentials)
        return rows as SellerProduct[]
      }
    }

    this.orders = {
      list: async (params) => {
        const customerId = await this.resolveMagentoCustomerId(params?.sellerId)
        if (!customerId) return fallback.orders.list(params)
        const rows = await this.magento.seller.getSellerOrders(customerId, this.credentials)
        return rows as SellerOrder[]
      }
    }

    this.transactions = {
      list: async (params) => {
        const customerId = await this.resolveMagentoCustomerId(params?.sellerId)
        if (!customerId) return fallback.transactions.list(params)
        const rows = await this.magento.seller.getSellerTransactions(customerId, this.credentials)
        return rows as SellerTransaction[]
      }
    }

    this.lowStock = {
      list: async (params) => {
        const customerId = await this.resolveMagentoCustomerId(params?.sellerId)
        if (!customerId) return fallback.lowStock.list(params)
        const rows = await this.magento.seller.getLowStockProducts(customerId, this.credentials)
        return rows as SellerLowStockItem[]
      }
    }

    this.shop = {
      get: async (params) => {
        const customerId = await this.resolveMagentoCustomerId(params?.sellerId)
        if (!customerId) return fallback.shop.get(params)
        const profile = await this.magento.seller.getShopProfile(customerId, this.credentials)
        return (profile as SellerShopProfile) ?? fallback.shop.get(params)
      },
      update: async (params) => {
        const { sellerId, limit, offset, ...updates } = params
        const customerId = await this.resolveMagentoCustomerId(sellerId)
        if (!customerId) return fallback.shop.update(params)
        const profile = await this.magento.seller.updateShopProfile(customerId, this.credentials, updates)
        return (profile as SellerShopProfile) ?? fallback.shop.update(params)
      }
    }
  }

  async getStats(params?: SellerListParams) {
    return this.fallback.getStats(params)
  }

  /**
   * A raw query, not `db.select().from(users)...` — importing
   * `#auth/auth-schema` pulls in that file's `relations()` calls
   * (drizzle-orm's pre-1.0 relational API), and the root workspace pins
   * `drizzle-orm@1.0.0-rc.4`, which dropped `relations` from the package's
   * main export. Since this runs inside a Nitro plugin (loaded once at
   * server boot, not lazily per-route), that import failure took down
   * every route on the site, not just the business dashboard — confirmed
   * 2026-09-15 reproducing against the real composed app. This needs only
   * the one column, so it never needs the schema module at all.
   */
  private async resolveMagentoCustomerId(sellerId?: string): Promise<number | null> {
    if (!sellerId) return null
    try {
      const rows = await db.execute<{ magento_customer_id: number | null }>(
        sql`SELECT magento_customer_id FROM users WHERE id = ${sellerId} LIMIT 1`
      )
      return rows[0]?.magento_customer_id ?? null
    } catch {
      // No DB reachable, or the user has no linked Magento customer yet —
      // callers fall back to mock data rather than erroring the page.
      return null
    }
  }
}
