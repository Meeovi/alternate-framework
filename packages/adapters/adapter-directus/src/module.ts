import { defineNuxtModule } from '@nuxt/kit'

export interface AdapterDirectusNuxtModuleOptions {
  enabled?: boolean
}

export default defineNuxtModule<AdapterDirectusNuxtModuleOptions>({
  meta: {
    name: '@mframework/adapter-directus/nuxt',
    configKey: 'adapterDirectus',
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
    publicConfig.adapterDirectus = {
      ...(publicConfig.adapterDirectus || {}),
      enabled: true,
    }
  },
})
