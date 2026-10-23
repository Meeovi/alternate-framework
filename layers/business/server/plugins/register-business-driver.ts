import { setDefaultBusinessDriver } from 'alternate-sdk'
import type { BusinessDriverContract } from 'alternate-sdk/contracts'
import { DefaultBusinessAdapter } from '../utils/defaultBusinessAdapter'
import { MagentoBusinessAdapter, directusSellerSource, magentoSellerSource } from '../utils/magentoBusinessAdapter'

/**
 * Registers the business/seller driver once at Nitro startup, the same way
 * `packages/plugins/CMS-Content/adapter-magento`'s Nuxt plugin self-registers into
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
 *
 * `BUSINESS_BACKEND` picks the backend explicitly (`magento`, `mock`).
 * Unset, the first configured backend in `BACKENDS` wins, which keeps the
 * old "Magento when its env is complete, otherwise mock" behaviour. Apps
 * never import a backend — they only call `/api/business/driver` — so a
 * new backend is one more `BACKENDS` entry here.
 */
type BackendFactory = {
  /** Whether this backend's env is complete enough to try it. */
  configured: () => boolean
  create: (fallback: BusinessDriverContract) => BusinessDriverContract
}

/** With public.magento.via 'directus' (adapter-magento's default), the
 *  seller dashboard reads the store through Directus's /commerce/sellers/*
 *  routes with the app's static token instead of the Integration. */
function viaDirectus() {
  const config = useRuntimeConfig() as Record<string, any>
  if (config.public?.magento?.via !== 'directus') return null
  const url = String(config.public?.directus?.url || '').replace(/\/+$/, '')
  const token = String(config.directus?.token || '')
  return url && token ? { url, token } : null
}

const BACKENDS: Record<string, BackendFactory> = {
  magento: {
    configured: () => Boolean(viaDirectus()) || Boolean(
      process.env.MAGENTO_GRAPHQL_URL
      && process.env.MAGENTO_CONSUMER_KEY
      && process.env.MAGENTO_CONSUMER_SECRET
      && process.env.MAGENTO_ACCESS_TOKEN
      && process.env.MAGENTO_ACCESS_TOKEN_SECRET
    ),
    create: (fallback) => {
      const directus = viaDirectus()
      return new MagentoBusinessAdapter(fallback, directus
        ? directusSellerSource(directus.url, directus.token)
        : magentoSellerSource(process.env.MAGENTO_GRAPHQL_URL as string, {
          consumerKey: process.env.MAGENTO_CONSUMER_KEY as string,
          consumerSecret: process.env.MAGENTO_CONSUMER_SECRET as string,
          accessToken: process.env.MAGENTO_ACCESS_TOKEN as string,
          accessTokenSecret: process.env.MAGENTO_ACCESS_TOKEN_SECRET as string,
        }))
    },
  },
}

export default defineNitroPlugin(() => {
  const fallback = new DefaultBusinessAdapter()
  const requested = process.env.BUSINESS_BACKEND?.trim().toLowerCase()

  if (requested === 'mock') {
    setDefaultBusinessDriver(fallback)
    return
  }

  const name = requested || Object.keys(BACKENDS).find((key) => BACKENDS[key]!.configured())
  const backend = name ? BACKENDS[name] : undefined

  if (requested && !backend) {
    console.error(`[business] Unknown BUSINESS_BACKEND "${requested}" (known: mock, ${Object.keys(BACKENDS).join(', ')}); using mock data`)
  } else if (backend && !backend.configured()) {
    console.error(`[business] BUSINESS_BACKEND "${name}" is missing its environment variables; using mock data`)
  } else if (backend) {
    try {
      setDefaultBusinessDriver(backend.create(fallback))
      return
    } catch (error) {
      console.error(`[business] Failed to initialize the "${name}" business backend, falling back to mock data:`, error)
    }
  }

  setDefaultBusinessDriver(fallback)
})
