import {
  addComponentsDir,
  addServerHandler,
  addServerPlugin,
  createResolver,
  defineNuxtModule,
  extendPages,
} from '@nuxt/kit'
import type { MeeoviDropshippingModuleOptions } from './runtime/types'

export type { MeeoviDropshippingModuleOptions } from './runtime/types'
export * from './runtime/types'

const env = process.env

/**
 * @mframework/meeovi-dropshipping — sellers connect their own supplier
 * accounts (Printful, CJdropshipping), import products into Magento under
 * their Webkul seller (Meeovi_MarketplaceApi sync routes), and the server
 * keeps stock in sync, forwards paid orders and brings tracking back.
 *
 * Needs: Directus collections (scripts/setup-directus.mjs), the Magento
 * Integration with the `Meeovi_MarketplaceApi::catalog_sync`,
 * `Magento_Sales::actions_view` and `Magento_Sales::ship` resources, and
 * NUXT_DROPSHIP_SECRET (≥ 32 chars) for sealing supplier credentials.
 */
export default defineNuxtModule<MeeoviDropshippingModuleOptions>({
  meta: {
    name: 'meeovi-dropshipping',
    configKey: 'meeoviDropshipping',
    compatibility: { nuxt: '^4.0.0' },
  },

  defaults: {
    apiBase: '/api/dropshipping',
    sessionEndpoint: '/api/auth/get-session',
    roles: ['seller', 'admin'],
    page: { path: '/workspace/stores/suppliers', layout: 'workspace', middleware: ['auth'] },
    providers: ['printful', 'cj'],
    sync: { stockEveryMinutes: 60, ordersEveryMinutes: 10 },
    printOnDemandQty: 999,
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const apiBase = (options.apiBase || '/api/dropshipping').replace(/\/+$/, '')

    nuxt.options.alias['#meeovi-dropshipping'] = resolver.resolve('runtime')

    // Server-only settings (credentials never reach the client bundle).
    // App-level runtimeConfig.meeoviDropshipping (if any) wins over these.
    nuxt.options.runtimeConfig.meeoviDropshipping = {
      ...{
        sessionEndpoint: options.sessionEndpoint,
        roles: options.roles,
        providers: options.providers,
        sync: options.sync,
        printOnDemandQty: options.printOnDemandQty,
        secret: env.NUXT_DROPSHIP_SECRET || '',
        directus: {
          url: env.DIRECTUS_URL || '',
          token: env.NUXTUS_DIRECTUS_STATIC_TOKEN || '',
        },
        magento: {
          graphqlUrl: env.MAGENTO_GRAPHQL_URL || '',
          consumerKey: env.MAGENTO_CONSUMER_KEY || '',
          consumerSecret: env.MAGENTO_CONSUMER_SECRET || '',
          accessToken: env.MAGENTO_ACCESS_TOKEN || '',
          accessTokenSecret: env.MAGENTO_ACCESS_TOKEN_SECRET || '',
        },
      },
      ...(nuxt.options.runtimeConfig.meeoviDropshipping as Record<string, unknown> | undefined),
    }
    nuxt.options.runtimeConfig.public.meeoviDropshipping = {
      apiBase,
      providers: options.providers,
      ...(nuxt.options.runtimeConfig.public.meeoviDropshipping as Record<string, unknown> | undefined),
    }

    addComponentsDir({ path: resolver.resolve('runtime/components'), pathPrefix: false })

    const routes: [string, 'get' | 'post' | 'patch' | 'delete', string][] = [
      ['/connections', 'get', 'connections.get'],
      ['/connections', 'post', 'connections.post'],
      ['/connections/:id', 'patch', 'connection.patch'],
      ['/connections/:id', 'delete', 'connection.delete'],
      ['/catalog', 'get', 'catalog.get'],
      ['/import', 'post', 'import.post'],
      ['/products', 'get', 'products.get'],
      ['/orders', 'get', 'orders.get'],
    ]
    for (const [route, method, file] of routes) {
      addServerHandler({ route: `${apiBase}${route}`, method, handler: resolver.resolve(`server/api/${file}`) })
    }
    addServerPlugin(resolver.resolve('server/plugins/scheduler'))

    if (options.page) {
      const page = options.page
      extendPages((pages) => {
        pages.push({
          name: 'meeovi-dropshipping-suppliers',
          path: page.path || '/workspace/stores/suppliers',
          file: resolver.resolve('runtime/pages/suppliers.vue'),
          // Set here, not with definePageMeta in the page, so apps can
          // change them through the module options. `roles` is enforced by
          // the auth layer's `auth` middleware.
          meta: { layout: page.layout || 'workspace', middleware: page.middleware ?? ['auth'], roles: options.roles },
        })
      })
    }
  },
})
