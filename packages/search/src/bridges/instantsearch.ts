import type { SearchManager } from '../core/SearchManager'

export function createInstantSearchBridge(manager: SearchManager) {
  return {
    searchFunction(helper: any) {
      manager.context.setQuery(helper.state.query || '')
      manager.context.setPage(helper.state.page || 1)
      // map filters if needed from helper.state

      return manager.search().then((result) => {
        helper.setResults({
          hits: result.items,
          nbHits: result.total,
          page: result.page - 1,
          hitsPerPage: result.pageSize
        })
      })
    }
  }
}