import { defineNuxtModule } from '@nuxt/kit'

export interface AdapterOpenSearchNuxtModuleOptions {
  enabled?: boolean
}

export default defineNuxtModule<AdapterOpenSearchNuxtModuleOptions>({
  meta: {
    name: '@mframework/adapter-opensearch/nuxt',
    configKey: 'adapterOpenSearch',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  defaults: {
    enabled: true,
  },
  setup(options, nuxt) {
    if (options.enabled === false) return

    const runtimeConfig = (nuxt.options.runtimeConfig || {}) as Record<string, any>
    runtimeConfig.public ||= {}
    nuxt.options.runtimeConfig = runtimeConfig as any

    const publicConfig = runtimeConfig.public as Record<string, any>
    publicConfig.adapterOpenSearch = {
      ...(publicConfig.adapterOpenSearch || {}),
      enabled: true,
    }
  },
})
