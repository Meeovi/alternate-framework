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

    // SVAR ships ESM that Nuxt's server build should bundle, not externalize
    // — every @svar-ui package, including SVAR's own dependencies. With only
    // vue-grid/vue-core/vue-editor transpiled, Vite left vue-core's import of
    // its nested core-locales (vue-core/node_modules/@svar-ui/core-locales@
    // 2.6.0) external by file path, while Nitro's dependency tracing dedupes
    // the two installed versions into one top-level copy — the production
    // server then 500s on every <MeeoviTable> page with "Cannot find module
    // …/vue-core/node_modules/@svar-ui/core-locales/locales/en.js".
    // (nitro.externals.inline doesn't help: the path is fixed by Vite's SSR
    // build before Nitro sees it.) Dev is unaffected.
    nuxt.options.build.transpile.push(/@svar-ui\//)

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
    addServerHandler({
      route: `${apiBase}/:collection`,
      method: 'post',
      handler: resolver.resolve('server/api/collection.post'),
    })
    addServerHandler({
      route: `${apiBase}/:collection/:id`,
      method: 'patch',
      handler: resolver.resolve('server/api/item.patch'),
    })
    addServerHandler({
      route: `${apiBase}/:collection/:id`,
      method: 'delete',
      handler: resolver.resolve('server/api/item.delete'),
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
