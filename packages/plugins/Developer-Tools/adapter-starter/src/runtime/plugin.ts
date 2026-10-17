import { defineNuxtPlugin, useNuxtApp, useRuntimeConfig } from '#app'
import { StarterAdapter } from '../index.js'
import { SearchAdapterRegistry, NotifyAdapterRegistry } from 'alternate-sdk'

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig() as Record<string, any>
  const options = config.public?.adapterStarter

  const adapterInstance = new StarterAdapter(options?.endpoint || '', options?.token)

  // Register adapter capabilities into the alternate-sdk registries
  // so shared composables can resolve them backend-agnostically
  SearchAdapterRegistry.register('adapter-starter', adapterInstance.content.search as any)
  // Auth is better-auth (layers/auth) only; adapters don't register an
  // SDK auth adapter.
  NotifyAdapterRegistry.register('adapter-starter', adapterInstance.content.notifications as any)

  nuxtApp.hook('app:created', () => {
    const target = nuxtApp.$sdk || {}
    Object.assign(target, adapterInstance)
  })

  return {}
})
