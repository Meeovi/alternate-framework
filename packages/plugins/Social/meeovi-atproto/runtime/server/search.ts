// Nitro plugin: adds the "atproto" provider (../search.ts) to the search
// layer's registry (layers/search/server/search/registry.ts). The
// Symbol.for() key is the whole contract, so nothing here imports from the
// layer.
import { defineNitroPlugin } from 'nitropack/runtime'
import { useRuntimeConfig } from '#imports'
import { createAtprotoSearchProvider, type AtprotoSearchConfig } from '../search'
import type { SearchProvider } from '../search-types'

const SEARCH_PROVIDER_REGISTRY_KEY = Symbol.for('mframework.search.providers')

// searchProviders.atproto is filled at build time; the service account is
// often only in the runtime env (ATPROTO_IDENTIFIER / ATPROTO_APP_PASSWORD,
// or runtimeConfig.atproto), so fall back to it — the same account the
// federation network signs in with (./bootstrap.ts).
function searchConfig(): AtprotoSearchConfig | undefined {
  const config = useRuntimeConfig() as Record<string, any>
  const search = config.searchProviders?.atproto as AtprotoSearchConfig | undefined
  if (!search) return undefined
  if (search.identifier && search.password) return search
  return {
    ...search,
    identifier: config.atproto?.identifier || process.env.ATPROTO_IDENTIFIER || '',
    password: config.atproto?.appPassword || process.env.ATPROTO_APP_PASSWORD || '',
  }
}

export default defineNitroPlugin(() => {
  const provider = createAtprotoSearchProvider(searchConfig)
  const store = globalThis as Record<symbol, Map<string, SearchProvider> | undefined>
  ;(store[SEARCH_PROVIDER_REGISTRY_KEY] ??= new Map()).set(provider.id, provider)
})
