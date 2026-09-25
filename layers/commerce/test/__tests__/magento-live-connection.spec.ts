import { describe, it, expect } from 'vitest'
import { MagentoAdapter } from 'adapter-magento'

// Proves layers/commerce's own dependency on `adapter-magento` (added
// alongside registering `adapter-magento/module` in nuxt.config.ts) really
// resolves and can reach the live Magento backend — previously only the
// consuming app (apps/ecosystem/meeovi-frontend) had this wired, so the
// commerce layer itself had no way to exercise the connection on its own.
//
// Read-only: there is no staging Magento instance, only the production
// store, so only side-effect-free queries run here. Mocked write-path
// coverage (seller registration, product/review create) lives in
// packages/plugins/CMS-Content/adapter-magento/test/seller.spec.ts and reviews.spec.ts
// — that package owns MagentoAdapter, this layer only needs to prove it's
// reachable from here. Set MAGENTO_SKIP_LIVE_TESTS=1 to skip.
const ENDPOINT = process.env.MAGENTO_GRAPHQL_URL || 'https://meeovi.com/graphql'

describe.skipIf(process.env.MAGENTO_SKIP_LIVE_TESTS === '1')('layers/commerce -> adapter-magento live connection', () => {
  it('reaches the real Magento storefront for shop config', async () => {
    const magento = new MagentoAdapter(ENDPOINT)
    const config = await magento.commerce.getStoreConfig()

    expect(config).toBeTruthy()
    expect(typeof config.store_name).toBe('string')
  }, 15000)

  it('reaches the real Magento storefront for the product catalog', async () => {
    const magento = new MagentoAdapter(ENDPOINT)
    const result = await magento.content.search('', { pageSize: 3, fields: ['sku', 'name'] })

    expect(Array.isArray(result.items)).toBe(true)
  }, 15000)
})
