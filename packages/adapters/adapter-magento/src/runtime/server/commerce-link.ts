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

  CommerceBackendRegistry.register(createMagentoCommerceBackendAdapter(magento))

  CommerceCustomerLinkRegistry.register({
    id: 'magento',
    isEnabled: () => Boolean(options.endpoint),
    async onUserCreated(user) {
      const [firstname, ...rest] = (user.name || 'Customer').trim().split(/\s+/)
      const created = await magento.commerce.createCustomer({
        firstname: firstname || 'Customer',
        lastname: rest.join(' ') || firstname || 'Customer',
        email: user.email,
      })
      return created?.id ? { externalCustomerId: String(created.id) } : undefined
    },
  })
})
