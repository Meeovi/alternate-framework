// Nitro plugin: adds the "atproto" provider (../search.ts) to the search
// layer's registry (layers/search/server/search/registry.ts). The
// Symbol.for() key is the whole contract, so nothing here imports from the
// layer.
import { defineNitroPlugin } from 'nitropack/runtime'
import { useRuntimeConfig } from '#imports'
import { createAtprotoSearchProvider, type AtprotoSearchConfig } from '../search'
import type { SearchProvider } from '../search-types'

const SEARCH_PROVIDER_REGISTRY_KEY = Symbol.for('mframework.search.providers')

export default defineNitroPlugin(() => {
  const provider = createAtprotoSearchProvider(() => (useRuntimeConfig() as Record<string, any>).searchProviders?.atproto as AtprotoSearchConfig | undefined)
  const store = globalThis as Record<symbol, Map<string, SearchProvider> | undefined>
  ;(store[SEARCH_PROVIDER_REGISTRY_KEY] ??= new Map()).set(provider.id, provider)
})
