import { setDefaultBusinessDriver } from 'alternate-sdk'
import { DefaultBusinessAdapter } from '../utils/defaultBusinessAdapter'
import { MagentoBusinessAdapter } from '../utils/magentoBusinessAdapter'

/**
 * Registers the business/seller driver once at Nitro startup, the same way
 * `packages/adapters/adapter-magento`'s Nuxt plugin self-registers into
 * `CommerceBackendRegistry`. `getBusinessDriver()`
 * (server/utils/business.ts) reads `BusinessDriverRegistry.getDefaultDriver()`
 * — which is what `setDefaultBusinessDriver` (the contract-level registry
 * in `contracts/business.ts`) sets, not the separate adapter-level registry
 * in `business/adapter.ts`. `POST /api/business/driver` then resolves
 * whatever is registered here.
 *
 * `MagentoBusinessAdapter` wraps `DefaultBusinessAdapter` and only takes
 * over shop/products/orders/transactions/lowStock (real Webkul data) when
 * `MAGENTO_GRAPHQL_URL` and all 4 OAuth 1.0a credentials below are
 * configured — without those, behavior is unchanged from mock data
 * everywhere. Create the Integration via the live store's Admin > System >
 * Extensions > Integrations (a dedicated integration, not your own admin
 * login) so it can be scoped/revoked independently of any person's
 * account — activating it there is what generates the consumer key/secret
 * and access token/secret pair (Magento Integrations are OAuth 1.0a, not
 * a bearer token, so all 4 values are required together).
 *
 * Construction is wrapped in try/catch on purpose: this runs once at
 * Nitro boot, so an unhandled throw here previously took down every
 * route on the site, not just the business dashboard (confirmed live
 * 2026-09-15 — a bad import elsewhere in this same startup path turned
 * into a site-wide 500). A misconfigured Magento env (malformed URL,
 * whatever else `MagentoBusinessAdapter`'s constructor might reject)
 * should degrade to mock data, not take the whole app down with it.
 */
export default defineNitroPlugin(() => {
  const fallback = new DefaultBusinessAdapter()

  const endpoint = process.env.MAGENTO_GRAPHQL_URL
  const consumerKey = process.env.MAGENTO_CONSUMER_KEY
  const consumerSecret = process.env.MAGENTO_CONSUMER_SECRET
  const accessToken = process.env.MAGENTO_ACCESS_TOKEN
  const accessTokenSecret = process.env.MAGENTO_ACCESS_TOKEN_SECRET

  if (endpoint && consumerKey && consumerSecret && accessToken && accessTokenSecret) {
    try {
      setDefaultBusinessDriver(
        new MagentoBusinessAdapter(fallback, endpoint, { consumerKey, consumerSecret, accessToken, accessTokenSecret })
      )
      return
    } catch (error) {
      console.error('[business] Failed to initialize MagentoBusinessAdapter, falling back to mock data:', error)
    }
  }

  setDefaultBusinessDriver(fallback)
})
