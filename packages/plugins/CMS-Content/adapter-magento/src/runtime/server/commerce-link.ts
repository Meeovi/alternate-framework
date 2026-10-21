import { defineNitroPlugin } from 'nitropack/runtime'
import { useRuntimeConfig } from '#imports'
import { CommerceCustomerLinkRegistry, CommerceBackendRegistry } from 'alternate-sdk'
// Self-referencing package import (matches runtime/plugin.ts) rather than a
// relative '../../index' — nuxt-module-build only compiles module.ts and
// runtime/** into dist/, not index.ts, so a relative import from the built
// dist/runtime/server/commerce-link.js would resolve to a dist/index.js
// that's never generated.
import { MagentoAdapter } from '@mframework/adapter-magento'
import { createMagentoCommerceBackendAdapter } from '../commerce-backend'
import { INTEGRATION_STORE_KEY, createMagentoIntegrationStore } from './integration-store'

const clean = (value: unknown) => String(value ?? '').trim().replace(/^(['"])(.*)\1$/, '$2')

/** The Magento Integration (OAuth 1.0a) for server-to-server admin calls
 *  — env only, never runtime config, so it can't reach the client. */
function integrationCredentials() {
  const credentials = {
    consumerKey: clean(process.env.MAGENTO_CONSUMER_KEY),
    consumerSecret: clean(process.env.MAGENTO_CONSUMER_SECRET),
    accessToken: clean(process.env.MAGENTO_ACCESS_TOKEN),
    accessTokenSecret: clean(process.env.MAGENTO_ACCESS_TOKEN_SECRET),
  }
  return Object.values(credentials).every(Boolean) ? credentials : null
}

// Runs in Nitro, separate from runtime/plugin.ts (a universal Vue plugin) —
// better-auth's signup flow is handled entirely server-side and doesn't go
// through the app's Vue plugin lifecycle. This is also the ONLY place
// CommerceBackendRegistry gets populated for pure Nitro server routes
// (server/api/*.ts calling layers/commerce's getDirectusFacade()) — those
// routes never execute Vue app plugins, so runtime/plugin.ts's own
// CommerceBackendRegistry.register() call (registered via addPlugin) is
// invisible to them. Confirmed live: before this registration existed, every
// server-only route's product/category/order reads silently fell through to
// real Directus regardless of the active commerce backend.
export default defineNitroPlugin(() => {
  const options = (useRuntimeConfig().public as any)?.magento || {}
  if (!options.endpoint) return

  // Confirmed live: `options.token` (GQL_KEY) is not a valid Magento
  // customer JWT — attaching it as the constructor's customerToken makes
  // Magento reject every GraphQL request on this client, including the
  // public/guest createCustomerV2 mutation used below. Customer creation
  // needs no auth at all, so the client is built without it.
  const magento = new MagentoAdapter(options.endpoint, options.storeCode)
  const credentials = integrationCredentials()

  // placePaidOrder (orders paid with the app's PayPal checkout) needs the
  // Integration; without it the adapter only reads.
  // With it, /workspace admins also manage customers, orders and refunds
  // (customers created there join MAGENTO_WEBSITE_ID, default 1).
  CommerceBackendRegistry.register(createMagentoCommerceBackendAdapter(magento, credentials, {
    websiteId: Number(process.env.MAGENTO_WEBSITE_ID) || 1,
  }))

  // Integrations are sold as Magento products (@mframework/meeovi-integrations).
  ;(globalThis as Record<symbol, unknown>)[INTEGRATION_STORE_KEY] = createMagentoIntegrationStore(magento, credentials)

  CommerceCustomerLinkRegistry.register({
    id: 'magento',
    isEnabled: () => Boolean(options.endpoint),
    async onUserCreated(user) {
      const [firstname, ...rest] = (user.name || 'Customer').trim().split(/\s+/)
      const created = await magento.commerce.createCustomer({
        firstname: firstname || 'Customer',
        lastname: rest.join(' ') || firstname || 'Customer',
        email: user.email,
        wantsToSell: Boolean(user.isSeller),
      })
      return created?.id ? { externalCustomerId: String(created.id) } : undefined
    },
  })
})
