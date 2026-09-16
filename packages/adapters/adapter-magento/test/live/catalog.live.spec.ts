import { describe, it, expect } from 'vitest'
import { MagentoAdapter } from '../../src/index'

// Real, read-only network calls against the live Magento storefront. There
// is no staging instance for this project (see test/seller.spec.ts and
// test/reviews.spec.ts for the mocked write-path coverage) — only these
// GET-shaped, side-effect-free queries are safe to run against production,
// so this file is deliberately reads-only. Set MAGENTO_SKIP_LIVE_TESTS=1 to
// skip it (e.g. in an offline/sandboxed environment).
const ENDPOINT = process.env.MAGENTO_GRAPHQL_URL || 'https://meeovi.com/graphql'

describe.skipIf(process.env.MAGENTO_SKIP_LIVE_TESTS === '1')('MagentoAdapter live reads', () => {
  const magento = new MagentoAdapter(ENDPOINT)

  it('getStoreConfig() returns the live store configuration (shop info)', async () => {
    const config = await magento.commerce.getStoreConfig()

    expect(config).toBeTruthy()
    expect(typeof config.store_name).toBe('string')
    expect(typeof config.base_currency_code).toBe('string')
  }, 15000)

  it('content.search() returns real catalog items via the working queryField path', async () => {
    const result = await magento.content.search('', { pageSize: 5, fields: ['sku', 'name'] })

    expect(Array.isArray(result.items)).toBe(true)
    if (result.items.length > 0) {
      expect(result.items[0]).toHaveProperty('sku')
    }
  }, 15000)

  // commerce.getProducts()/getProductBySku()/getCategories()/etc. used to
  // go through `store.readEntity` (confirmed live it always threw — see
  // catalog.spec.ts's header comment). Now fixed to use `store.queryField`
  // like content.search above; these confirm the fix against the real
  // storefront, not just a mock.
  it('commerce.getProducts() returns real catalog items', async () => {
    const products = await magento.commerce.getProducts({ pageSize: 5 })

    expect(Array.isArray(products)).toBe(true)
    if (products.length > 0) {
      expect(products[0]).toHaveProperty('sku')
    }
  }, 15000)

  it('commerce.getProductBySku() resolves a real product by sku', async () => {
    const [first] = await magento.commerce.getProducts({ pageSize: 1 })
    if (!first?.sku) return // nothing in the live catalog to look up right now

    const product = await magento.commerce.getProductBySku(first.sku)
    expect(product).toBeTruthy()
    expect(product.sku).toBe(first.sku)
  }, 15000)

  it('commerce.getCategories() returns real category items', async () => {
    const categories = await magento.commerce.getCategories({ pageSize: 5 })

    expect(Array.isArray(categories)).toBe(true)
    if (categories.length > 0) {
      expect(categories[0]).toHaveProperty('id')
    }
  }, 15000)

  it('commerce.getCategoryTree() resolves without throwing', async () => {
    const tree = await magento.commerce.getCategoryTree({ pageSize: 5 })
    expect(Array.isArray(tree)).toBe(true)
  }, 15000)

  it('getProductReviews() resolves for a real SKU without throwing, even with zero reviews', async () => {
    const result = await magento.content.search('', { pageSize: 1, fields: ['sku'] })
    const sku = result.items?.[0]?.sku

    if (!sku) {
      // Nothing in the live catalog to check reviews against right now —
      // not a failure of this adapter, just nothing to assert against.
      return
    }

    const reviews = await magento.commerce.getProductReviews(sku)
    expect(Array.isArray(reviews)).toBe(true)
  }, 15000)
})
