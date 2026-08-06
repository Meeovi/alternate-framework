// packages/adapters/adapter-magento/src/module.ts
import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

export interface ModuleOptions {
  /** The endpoint URL for your Magento instance or Hive Gateway endpoint */
  endpoint?: string
  /** Optional store view code identifier (e.g., 'default', 'fr') */
  storeCode?: string
  /** Optional customer/admin token for authenticated graph requests */
  token?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@mframework/adapter-magento',
    configKey: 'magento'
  },
  defaults: {
    endpoint: '',
    storeCode: undefined,
    token: undefined
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // 1. Push module configurations into public runtime config so the runtime plugin can read them
    nuxt.options.runtimeConfig.public.magento = {
      ...nuxt.options.runtimeConfig.public.magento,
      ...options
    }

    // 2. Register the local runtime plugin that exposes the $magentoAdapter global context
    addPlugin(resolver.resolve('./runtime/plugin'))
  }
})