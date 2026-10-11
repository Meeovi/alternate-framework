import {
  defineNuxtModule,
  createResolver,
  addComponentsDir,
  addImportsDir,
  addServerHandler,
} from '@nuxt/kit'
import type { MeeoviTablesModuleOptions } from './runtime/types'

export type { MeeoviTablesModuleOptions } from './runtime/types'
export * from './runtime/types'

const env = process.env

export default defineNuxtModule<MeeoviTablesModuleOptions>({
  meta: {
    name: 'meeovi-tables',
    configKey: 'meeoviTables',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },

  defaults: {
    apiBase: '/api/tables',
    collections: {},
    pageSize: 25,
    maxPageSize: 200,
    sessionEndpoint: '/api/auth/get-session',
    directus: {
      url: env.MEEOVI_TABLES_DIRECTUS_URL || env.DIRECTUS_URL,
      token: env.MEEOVI_TABLES_DIRECTUS_TOKEN || env.NUXTUS_DIRECTUS_STATIC_TOKEN,
    },
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const apiBase = (options.apiBase || '/api/tables').replace(/\/+$/, '')

    // `#meeovi-tables` → runtime dir, for explicit imports in app code.
    nuxt.options.alias['#meeovi-tables'] = resolver.resolve('runtime')
    nuxt.options.alias['#meeovi-tables/'] = resolver.resolve('runtime') + '/'

    // <MeeoviTable> and useMeeoviTable()
    addComponentsDir({ path: resolver.resolve('runtime/components'), pathPrefix: false })
    addImportsDir(resolver.resolve('runtime/composables'))

    // SVAR ships ESM that Nuxt's server build should bundle, not externalize.
    nuxt.options.build.transpile.push('@svar-ui/vue-grid', '@svar-ui/vue-core')

    addServerHandler({
      route: apiBase,
      method: 'get',
      handler: resolver.resolve('server/api/index.get'),
    })
    addServerHandler({
      route: `${apiBase}/:collection`,
      method: 'get',
      handler: resolver.resolve('server/api/collection.get'),
    })

    // Private config — the Directus token and the collection allowlist
    // never reach the client bundle.
    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
    runtimeConfig.meeoviTables = {
      ...(runtimeConfig.meeoviTables as Record<string, unknown> || {}),
      collections: { ...options.collections },
      pageSize: options.pageSize || 25,
      maxPageSize: options.maxPageSize || 200,
      sessionEndpoint: options.sessionEndpoint || '/api/auth/get-session',
      directus: { ...options.directus },
    }

    // Public config — API location and paging defaults only.
    nuxt.options.runtimeConfig.public.meeoviTables = {
      ...(nuxt.options.runtimeConfig.public.meeoviTables as Record<string, unknown> || {}),
      apiBase,
      pageSize: options.pageSize || 25,
    }
  },
})
