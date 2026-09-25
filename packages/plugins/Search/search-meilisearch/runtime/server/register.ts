// Adds a provider to the search layer's registry
// (layers/search/server/search/registry.ts). The shared Symbol.for() key is
// the whole contract, so this plugin never imports from the layer.
import type { SearchProvider } from './types'

const SEARCH_PROVIDER_REGISTRY_KEY = Symbol.for('mframework.search.providers')

export function registerSearchProvider(provider: SearchProvider): void {
  const store = globalThis as Record<symbol, Map<string, SearchProvider> | undefined>
  ;(store[SEARCH_PROVIDER_REGISTRY_KEY] ??= new Map()).set(provider.id, provider)
}
