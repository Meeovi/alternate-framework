import { defineNuxtModule, addPlugin, createResolver, addImportsDir } from '@nuxt/kit'

export interface ModuleOptions {
  url: string
  store?: string
  adminToken?: string
  customerTokenCookie?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-magento',
    configKey: 'magento'
  },

  defaults: {
    url: '',
    store: 'default',
    adminToken: '',
    customerTokenCookie: 'magento_customer_token'
  },

  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.magento = {
      url: options.url,
      store: options.store,
      adminToken: options.adminToken,
      customerTokenCookie: options.customerTokenCookie,
      public: {
        url: options.url,
        store: options.store
      }
    }

    addPlugin(resolve('./runtime/plugin'))
    addImportsDir(resolve('./composables'))
  }
})
