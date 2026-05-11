import { defineNuxtModule } from '@nuxt/kit'

export interface AdapterMagentoNuxtModuleOptions {
  enabled?: boolean
}

export default defineNuxtModule<AdapterMagentoNuxtModuleOptions>({
  meta: {
    name: '@mframework/adapter-magento/nuxt',
    configKey: 'adapterMagento',
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
    publicConfig.adapterMagento = {
      ...(publicConfig.adapterMagento || {}),
      enabled: true,
    }
  },
})
