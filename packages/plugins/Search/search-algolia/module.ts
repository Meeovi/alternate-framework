import { defineNuxtModule, createResolver, addServerPlugin } from '@nuxt/kit'

export interface ModuleOptions {
  /** Defaults to true when both appId and apiKey are set. */
  enabled?: boolean
  appId?: string
  /** Search-only API key is enough — this provider never writes. */
  apiKey?: string
  indexName?: string
}

const env = process.env

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@mframework/search-algolia',
    configKey: 'searchAlgolia',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },

  // Same env vars the search layer used before this provider was split
  // out, so existing deployments keep working unchanged.
  defaults: {
    appId: env.ALTERNATE_SEARCH_ALGOLIA_APP_ID || '',
    apiKey: env.ALTERNATE_SEARCH_ALGOLIA_API_KEY || '',
    indexName: env.ALTERNATE_SEARCH_ALGOLIA_INDEX || 'products',
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Kept at runtimeConfig.searchProviders.algolia — where the provider reads
    // it, and where NUXT_SEARCH_PROVIDERS_ALGOLIA_* env overrides land.
    // Private — credentials never reach the client bundle.
    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
    runtimeConfig.searchProviders = {
      ...(runtimeConfig.searchProviders || {}),
      algolia: { ...options, enabled: options.enabled ?? Boolean(options.appId && options.apiKey) },
    }

    addServerPlugin(resolver.resolve('runtime/server/plugin'))
  },
})
