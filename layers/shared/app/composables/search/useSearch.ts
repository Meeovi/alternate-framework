import { SearchAdapterRegistry } from 'alternate-sdk'

type AnyRecord = Record<string, any>

function resolveGatewaySearch(): AnyRecord {
  const runtime = globalThis as AnyRecord
  const gatewayFactory = runtime.useGateway

  if (typeof gatewayFactory !== 'function') {
    return {}
  }

  try {
    const gateway = gatewayFactory() as AnyRecord
    return (gateway?.search as AnyRecord) || {}
  } catch {
    return {}
  }
}

export function useSearch() {
  const registryAdapter = SearchAdapterRegistry.getDefaultAdapter()
  const search = registryAdapter ? { ...registryAdapter } : resolveGatewaySearch()

  return {
    search: (query: string, options?: AnyRecord) => search?.search?.(query, options) ?? [],
    suggest: (query: string) => search?.suggest?.(query) ?? [],
    index: (doc: AnyRecord) => search?.index?.(doc),
    stats: () => search?.stats?.(),
    clear: () => search?.clear?.(),
    getAdapter: () => search,
  }
}
