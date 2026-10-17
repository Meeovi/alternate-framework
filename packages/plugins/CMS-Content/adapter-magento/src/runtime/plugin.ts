// packages/plugins/CMS-Content/adapter-magento/src/runtime/plugin.ts
import { defineNuxtPlugin, useNuxtApp, useRuntimeConfig } from 'nuxt/app'
import { MagentoAdapter } from '@mframework/adapter-magento'
import { SearchAdapterRegistry, NotifyAdapterRegistry, CommerceBackendRegistry } from 'alternate-sdk'
import { createMagentoCommerceBackendAdapter } from './commerce-backend'

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()
  const options = (config.public?.magento || {}) as Record<string, any>

  // options?.token (GQL_KEY) is intentionally NOT passed as customerToken —
  // confirmed live against a real Magento instance that it isn't a valid
  // customer JWT, and attaching it makes Magento reject every GraphQL
  // request on this client (including plain public product/category
  // reads), not just customer-scoped ones.
  const adapterInstance = new MagentoAdapter(options?.endpoint || '', options?.storeCode)

  // Register adapter capabilities into the alternate-sdk registries
  // so shared composables can resolve them backend-agnostically
  if (adapterInstance.content) {
    SearchAdapterRegistry.register('magento', adapterInstance.content.search as any)
    // Auth is better-auth (layers/auth) only; adapters don't register an
    // SDK auth adapter.
    NotifyAdapterRegistry.register('magento', adapterInstance.content.notifications as any)
  }
  // During SSR this runs in the same process as the Nitro plugin
  // (runtime/server/commerce-link.ts), whose registration carries the
  // server-only Integration (placePaidOrder) — don't replace it.
  if (!CommerceBackendRegistry.get('magento')) {
    CommerceBackendRegistry.register(createMagentoCommerceBackendAdapter(adapterInstance))
  }

  // Expose the adapter instance as $magentoAdapter on the Nuxt app context
  nuxtApp.$magentoAdapter = adapterInstance

  return {
    provide: {
      magentoAdapter: adapterInstance
    }
  }
})