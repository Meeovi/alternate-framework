import { defineNuxtModule, createResolver, addServerPlugin } from '@nuxt/kit'

export interface ModuleOptions {
  /** Defaults to true when host is set. */
  enabled?: boolean
  host?: string
  port?: number
  protocol?: string
  apiKey?: string
  collectionName?: string
  idField?: string
}

const env = process.env

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@mframework/search-typesense',
    configKey: 'searchTypesense',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },

  // Same env vars the search layer used before this provider was split
  // out, so existing deployments keep working unchanged.
  defaults: {
    host: env.ALTERNATE_SEARCH_TYPESENSE_HOST || '',
    port: parseInt(env.ALTERNATE_SEARCH_TYPESENSE_PORT || '443'),
    protocol: env.ALTERNATE_SEARCH_TYPESENSE_PROTOCOL || 'https',
    apiKey: env.ALTERNATE_SEARCH_TYPESENSE_API_KEY || '',
    collectionName: env.ALTERNATE_SEARCH_TYPESENSE_COLLECTION || 'products',
    idField: env.ALTERNATE_SEARCH_TYPESENSE_ID_FIELD || 'id',
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Kept at runtimeConfig.searchProviders.typesense — where the provider reads
    // it, and where NUXT_SEARCH_PROVIDERS_TYPESENSE_* env overrides land.
    // Private — credentials never reach the client bundle.
    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
    runtimeConfig.searchProviders = {
      ...(runtimeConfig.searchProviders || {}),
      typesense: { ...options, enabled: options.enabled ?? Boolean(options.host) },
    }

    addServerPlugin(resolver.resolve('runtime/server/plugin'))
  },
})
