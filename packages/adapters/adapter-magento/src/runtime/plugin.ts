// packages/adapters/adapter-magento/src/runtime/plugin.ts
import { defineNuxtPlugin, useNuxtApp, useRuntimeConfig } from '#app'
import { MagentoAdapter } from '../index.js'
import { SearchAdapterRegistry, AuthAdapterRegistry, NotifyAdapterRegistry } from 'alternate-sdk'

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig() as Record<string, any>
  const options = config.public?.magento || config.public?.magentoAdapter

  const adapterInstance = new MagentoAdapter(options?.endpoint || '', options?.token)

  // Register adapter capabilities into the alternate-sdk registries
  // so shared composables can resolve them backend-agnostically
  if (adapterInstance.content) {
    SearchAdapterRegistry.register('magento', adapterInstance.content.search as any)
    AuthAdapterRegistry.register('magento', adapterInstance.content.auth as any)
    NotifyAdapterRegistry.register('magento', adapterInstance.content.notifications as any)
  }

  nuxtApp.hook('app:created', () => {
    const target = nuxtApp.$sdk || {}
    Object.assign(target, adapterInstance)
  })

  return {}
})