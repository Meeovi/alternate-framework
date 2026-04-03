import type { BuiltSearchQuery } from "../core/QueryBuilder";
import type { SearchManager } from "../core/SearchManager";

export type InstantSearchRequest = {
  indexName: string;
  params: Record<string, any>;
};

export type InstantSearchResult = {
  results: {
    hits: any[];
    nbHits: number;
    page: number;
    hitsPerPage: number;
  };
};

function mapRequestToQuery(params: Record<string, any>, existing?: Partial<BuiltSearchQuery>) {
  const q: Partial<BuiltSearchQuery> = existing ?? {};

  if (typeof params.query === "string") q.term = params.query;
  if (typeof params.page === "number") q.page = params.page + 1;
  if (typeof params.hitsPerPage === "number") q.pageSize = params.hitsPerPage;

  if (params.filters && typeof params.filters === "string") {
    const entries = params.filters.split(" AND ").map((s: string) => s.split(":"));
    q.filters = Object.fromEntries(entries.map(([k, v]) => [k, (v ?? "").replace(/^"|"$/g, "")]));
  }

  return q as BuiltSearchQuery;
}

export function createInstantSearchClientBridge(manager: SearchManager) {
  return {
    async search(requests: InstantSearchRequest[]): Promise<InstantSearchResult[]> {
      const results: InstantSearchResult[] = [];

      for (const req of requests) {
        const params = req.params || {};
        const built = mapRequestToQuery(params);

        manager.context.setQuery(built.term || "");
        manager.context.setPage(built.page || 1);
        manager.context.setPageSize(built.pageSize || manager.context.state.pageSize);
        if (built.filters) {
          manager.context.state.filters = built.filters as any;
        }

        const res = await manager.search();
        const r = res as any;

        results.push({
          results: {
            hits: r.items,
            nbHits: r.total,
            page: (r.page || 1) - 1,
            hitsPerPage: r.pageSize || manager.context.state.pageSize,
          },
        });
      }

      return results;
    },

    async searchForFacetValues(indexName: string, params: any) {
      const built = mapRequestToQuery({ query: params.facetQuery });
      manager.context.setQuery(built.term || "");
      manager.context.setPage(1);
      const res = (await manager.search()) as any;

      return {
        facetHits: (res.items || []).map((item: any) => ({ value: item[params.attribute], count: 0 })),
        exhaustiveFacetsCount: true,
      };
    },
  };
}

export const createSearchkitBridge = createInstantSearchClientBridge;
export const createStorefrontBridge = createInstantSearchClientBridge;
