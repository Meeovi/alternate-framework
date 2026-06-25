import type { SearchManager } from "../core/SearchManager";

export function createInstantSearchBridge(manager: SearchManager) {
  return {
    async searchFunction(helper: any) {
      manager.context.setQuery(helper.state.query || "");
      manager.context.setPage(helper.state.page || 1);

      const result = (await manager.search()) as any;
      helper.setResults({
        hits: result.items,
        nbHits: result.total,
        page: result.page - 1,
        hitsPerPage: result.pageSize,
      });
    },
  };
}
