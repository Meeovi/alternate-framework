import { defineNuxtPlugin, useNuxtApp, useRuntimeConfig } from '#app'
import { StarterAdapter } from '../index.js'
import { SearchAdapterRegistry, AuthAdapterRegistry, NotifyAdapterRegistry } from 'alternate-sdk'

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig() as Record<string, any>
  const options = config.public?.adapterStarter

  const adapterInstance = new StarterAdapter(options?.endpoint || '', options?.token)

  // Register adapter capabilities into the alternate-sdk registries
  // so shared composables can resolve them backend-agnostically
  SearchAdapterRegistry.register('adapter-starter', adapterInstance.content.search as any)
  AuthAdapterRegistry.register('adapter-starter', adapterInstance.content.auth as any)
  NotifyAdapterRegistry.register('adapter-starter', adapterInstance.content.notifications as any)

  nuxtApp.hook('app:created', () => {
    const target = nuxtApp.$sdk || {}
    Object.assign(target, adapterInstance)
  })

  return {}
})
