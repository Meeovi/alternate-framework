// packages/adapters/adapter-directus/src/runtime/plugin.ts
import { defineNuxtPlugin, useNuxtApp, useRuntimeConfig } from '#app'
import { DirectusAdapter } from '../index.js'
import { SearchAdapterRegistry, AuthAdapterRegistry, NotifyAdapterRegistry } from 'alternate-sdk'

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig() as Record<string, any>
  const options = config.public?.directus

  const adapterInstance = new DirectusAdapter(options?.url || '', options?.auth?.token)

  // Register adapter capabilities into the alternate-sdk registries
  // so shared composables can resolve them backend-agnostically
  SearchAdapterRegistry.register('directus', adapterInstance.content.search as any)
  AuthAdapterRegistry.register('directus', adapterInstance.content.auth as any)
  NotifyAdapterRegistry.register('directus', adapterInstance.content.notifications as any)

  nuxtApp.hook('app:created', () => {
    const target = nuxtApp.$sdk || {}
    Object.assign(target, adapterInstance)
  })

  return {}
})