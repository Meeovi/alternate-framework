export function useSearch() {
  const adapter = SearchAdapterRegistry.getDefaultAdapter()

  return {
    search: (query, options) => adapter.search(query, options),
    suggest: (query) => adapter.suggest(query),
    index: (doc) => adapter.index(doc),
    stats: () => adapter.stats(),
    getAdapter: () => adapter,
  }
}