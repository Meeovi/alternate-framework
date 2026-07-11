// packages/adapters/adapter-magento/src/runtime/plugin.ts
import { defineNuxtPlugin, useNuxtApp, useRuntimeConfig } from '#app'
import { MagentoAdapter } from '@mframework/adapter-magento'

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()
  const options = config.magento

  const adapterInstance = new MagentoAdapter(options?.endpoint || '', options?.token)

  if (nuxtApp.$sdk) {
    Object.assign(nuxtApp.$sdk, adapterInstance)
  } else {
    nuxtApp.$sdk = adapterInstance as any
  }

  return {}
})