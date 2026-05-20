import {
  defineNuxtModule,
  addPlugin,
  addServerHandler,
  createResolver,
} from '@nuxt/kit'

export interface MagentoModuleOptions {
  url ? : string
  token ? : string
  provider ? : 'rest' | 'graphql'
}

export default defineNuxtModule < MagentoModuleOptions > ({
  meta: {
    name: 'adapter-magento',
    configKey: 'magento',
  },

  defaults: {
    url: process.env.MAGENTO_URL,
    token: process.env.MAGENTO_TOKEN,
    provider: 'rest',
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.magento = {
      url: options.url,
      token: options.token,
      provider: options.provider,
    }

    addPlugin(resolver.resolve('./runtime/plugin'))

    addServerHandler({
      route: '/api/magento',
      handler: resolver.resolve('./runtime/server/api/magento'),
    })

    addServerHandler({
      route: '/api/magento/customer/login',
      handler: resolver.resolve('./runtime/server/api/magento-customer-login'),
    })

    addServerHandler({
      route: '/api/magento/customer/logout',
      handler: resolver.resolve('./runtime/server/api/magento-customer-logout'),
    })

    addServerHandler({
      route: '/**',
      handler: resolver.resolve('./runtime/server/middleware/magento-auth-guard'),
    })

    nuxt.hook('imports:dirs', (dirs) => {
      dirs.push(resolver.resolve('./runtime/composables'))
    })
  },
})
