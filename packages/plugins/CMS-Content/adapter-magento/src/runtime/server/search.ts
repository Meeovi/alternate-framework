// Nitro plugin: adds Magento product search to the search layer's provider
// registry (layers/search/server/search/registry.ts). The Symbol.for() key
// is the whole contract, so nothing here imports from the layer.
import { magentoProvider } from './search-provider'
import type { SearchProvider } from './search-types'

const SEARCH_PROVIDER_REGISTRY_KEY = Symbol.for('mframework.search.providers')

export default function registerMagentoSearch() {
  const store = globalThis as Record<symbol, Map<string, SearchProvider> | undefined>
  ;(store[SEARCH_PROVIDER_REGISTRY_KEY] ??= new Map()).set(magentoProvider.id, magentoProvider)
}
