// packages/adapters/adapter-directus/src/runtime/plugin.ts
import { defineNuxtPlugin, useNuxtApp, useRuntimeConfig } from '#app'
import { DirectusAdapter } from '../index.js'

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()
  const options = config.directus

  const adapterInstance = new DirectusAdapter(options?.url || '', options?.auth?.token)

  nuxtApp.hook('app:created', () => {
    const target = nuxtApp.$sdk || {}
    Object.assign(target, adapterInstance)
  })

  return {}
})