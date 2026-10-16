import type { MagentoAdapter, MagentoOAuth1Credentials } from '@mframework/adapter-magento'

/**
 * Magento as the store that sells integrations
 * (@mframework/meeovi-integrations looks it up under
 * Symbol.for('mframework.integrations.store')): a plugin's manifest names
 * the SKU that sells it; the product, its price and its Webkul seller are
 * Magento's, and so is the record of who paid for it.
 *
 * Shape matches meeovi-integrations' IntegrationStore (structural — no
 * package dependency either way).
 */

export const INTEGRATION_STORE_KEY = Symbol.for('mframework.integrations.store')

/** The app's key for a Magento product (cart lines, /product/<key>). */
export const magentoProductRef = (sku: string) => `magento:${sku}`

const PRODUCT_FIELDS = [
  'sku', 'name', 'stock_status',
  { price_range: [{ minimum_price: [{ final_price: ['value', 'currency'] }] }] },
  { short_description: ['html'] },
  { description: ['html'] },
  { small_image: ['url'] },
]

const plainText = (html: unknown) =>
  String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() || null

export function createMagentoIntegrationStore(magento: MagentoAdapter, credentials: MagentoOAuth1Credentials | null) {
  return {
    id: 'magento',

    /** Products for these SKUs that Magento sells (missing ones left out). */
    async products(skus: string[]) {
      const wanted = [...new Set(skus.filter(Boolean))]
      if (!wanted.length) return []
      const result = await magento.store.queryField('products', {
        filter: { sku: { in: wanted } },
        pageSize: wanted.length,
      }, { fields: [{ items: PRODUCT_FIELDS }] })
      const items: any[] = result?.items ?? []

      // The seller is display-only (and what lets a developer use their
      // own paid integration): without the Integration, or if the lookup
      // fails, products are still listed, just without one.
      const sellers = new Map<string, { id: string, name: string | null }>()
      if (credentials && items.length) {
        const rows = await magento.marketplaceOrders.productSellers(credentials, items.map((i) => String(i.sku)))
          .catch(() => [])
        for (const row of rows) {
          sellers.set(row.sku, { id: String(row.seller_id), name: row.shop_title?.trim() || null })
        }
      }

      return items.map((item) => {
        const sku = String(item.sku)
        const price = Number(item.price_range?.minimum_price?.final_price?.value ?? 0)
        return {
          sku,
          ref: magentoProductRef(sku),
          name: String(item.name ?? sku),
          description: plainText(item.short_description?.html) || plainText(item.description?.html),
          price: Number.isFinite(price) && price > 0 ? price : 0,
          currency: item.price_range?.minimum_price?.final_price?.currency ?? null,
          image: item.small_image?.url ?? null,
          seller: sellers.get(sku) ?? null,
        }
      })
    },

    /** better-auth's link to the user's Magento customer. */
    customerId(user: Record<string, unknown>): string | null {
      const id = Number(user?.magentoCustomerId)
      return Number.isInteger(id) && id > 0 ? String(id) : null
    },

    /** SKUs the customer paid for and wasn't refunded. Throws when it can't
     *  tell (no Integration configured, Magento unreachable). */
    async purchasedSkus(customerId: string): Promise<string[]> {
      if (!credentials) throw new Error('Magento Integration is not configured')
      return magento.marketplaceOrders.purchasedSkus(credentials, Number(customerId))
    },
  }
}
