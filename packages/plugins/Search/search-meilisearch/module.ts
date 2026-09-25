import { defineNuxtModule, createResolver, addServerPlugin } from '@nuxt/kit'

export interface ModuleOptions {
  /** Defaults to true when host is set. */
  enabled?: boolean
  host?: string
  apiKey?: string
  indexUid?: string
  idField?: string
}

const env = process.env

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@mframework/search-meilisearch',
    configKey: 'searchMeilisearch',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },

  // Same env vars the search layer used before this provider was split
  // out, so existing deployments keep working unchanged.
  defaults: {
    host: env.ALTERNATE_SEARCH_MEILISEARCH_HOST || '',
    apiKey: env.ALTERNATE_SEARCH_MEILISEARCH_API_KEY || '',
    indexUid: env.ALTERNATE_SEARCH_MEILISEARCH_INDEX || 'products',
    idField: env.ALTERNATE_SEARCH_MEILISEARCH_ID_FIELD || 'id',
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Kept at runtimeConfig.searchProviders.meilisearch — where the provider reads
    // it, and where NUXT_SEARCH_PROVIDERS_MEILISEARCH_* env overrides land.
    // Private — credentials never reach the client bundle.
    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
    runtimeConfig.searchProviders = {
      ...(runtimeConfig.searchProviders || {}),
      meilisearch: { ...options, enabled: options.enabled ?? Boolean(options.host) },
    }

    addServerPlugin(resolver.resolve('runtime/server/plugin'))
  },
})
