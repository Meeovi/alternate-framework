// server/search/registry.ts
//
// Runtime registry for search providers shipped as plugins
// (packages/plugins/Search/search-*). A plugin's Nitro plugin adds its
// provider to a Map stored on globalThis under a Symbol.for() key, so it
// never has to import anything from this layer — and because Nitro
// plugins run at server start, getEnabledProviders() stays synchronous.
//
// The key and the SearchProvider shape (server/providers/types.ts) are the
// whole contract; don't rename either without updating every plugin.
import type { SearchProvider } from '../providers/types'

export const SEARCH_PROVIDER_REGISTRY_KEY = Symbol.for('mframework.search.providers')

function registry(): Map<string, SearchProvider> {
  const store = globalThis as Record<symbol, Map<string, SearchProvider> | undefined>
  return (store[SEARCH_PROVIDER_REGISTRY_KEY] ??= new Map())
}

export function registerSearchProvider(provider: SearchProvider): void {
  registry().set(provider.id, provider)
}

export function getRegisteredProviders(): SearchProvider[] {
  return [...registry().values()]
}
