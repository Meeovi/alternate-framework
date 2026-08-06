// packages/adapters/adapter-magento/src/runtime/plugin.ts
import { defineNuxtPlugin, useNuxtApp, useRuntimeConfig } from 'nuxt/app'
import { MagentoAdapter } from '@mframework/adapter-magento'
import { SearchAdapterRegistry, AuthAdapterRegistry, NotifyAdapterRegistry } from 'alternate-sdk'

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()
  const options = (config.public?.magento || {}) as Record<string, any>

  const adapterInstance = new MagentoAdapter(options?.endpoint || '', options?.token)

  // Register adapter capabilities into the alternate-sdk registries
  // so shared composables can resolve them backend-agnostically
  if (adapterInstance.content) {
    SearchAdapterRegistry.register('magento', adapterInstance.content.search as any)
    AuthAdapterRegistry.register('magento', adapterInstance.content.auth as any)
    NotifyAdapterRegistry.register('magento', adapterInstance.content.notifications as any)
  }

  // Expose the adapter instance as $magentoAdapter on the Nuxt app context
  nuxtApp.$magentoAdapter = adapterInstance

  return {
    provide: {
      magentoAdapter: adapterInstance
    }
  }
})