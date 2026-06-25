// manager/core/SearchManager.ts

import { QueryBuilder } from "./QueryBuilder";
import { SearchPipeline } from "./Pipeline";
import { SearchContext, type SearchContextState } from "./SearchContext";
import { getAllSearchAdapters } from "../adapter/registry";
import type { MeeoviSearchAdapter, MeeoviSearchResult } from "../adapter/types";

export class SearchManager {
  context: SearchContext;
  pipeline: SearchPipeline;
  adapter: MeeoviSearchAdapter;

  constructor(adapter: MeeoviSearchAdapter, initial?: Partial<SearchContextState>) {
    this.context = new SearchContext(initial);
    this.pipeline = new SearchPipeline();
    this.adapter = adapter;
  }

  async searchWithParams(params: Partial<SearchContextState>): Promise<MeeoviSearchResult> {
    this.context.merge(params);
    return this.search();
  }

  async search(): Promise<MeeoviSearchResult> {
    const builder = new QueryBuilder(this.context);

    let query = builder.build();
    query = this.pipeline.runBefore(query) as typeof query;

    const result = await this.adapter.search(query);

    return this.pipeline.runAfter(result) as MeeoviSearchResult;
  }

  /**
   * Federated search across all adapters that support search.
   */
  async searchAllAdapters(params: Partial<SearchContextState>): Promise<MeeoviSearchResult> {
    const adapters = getAllSearchAdapters()
      .filter(([_, adapter]) => adapter.capabilities?.search !== false);

    const results: MeeoviSearchResult[] = await Promise.all(
      adapters.map(([index, adapter]) => {
        const manager = new SearchManager(adapter);
        return manager.searchWithParams({ ...params, index });
      })
    );

    return {
      items: results.flatMap(r => r.items),
      total: results.reduce((sum, r) => sum + r.total, 0),
      facets: mergeFacets(results),
      page: 1,
      pageSize: params.pageSize || 12
    };
  }
}

/**
 * Merge facets from multiple adapters.
 */
function mergeFacets(results: MeeoviSearchResult[]) {
  const merged: Record<string, Record<string, number>> = {};

  for (const r of results) {
    const facets = r.facets || {};
    for (const [facetName, facetData] of Object.entries(facets)) {
      if (!merged[facetName]) merged[facetName] = {};

      // Object-style facets
      if (facetData && typeof facetData === "object" && !Array.isArray(facetData)) {
        for (const [value, count] of Object.entries(facetData)) {
          merged[facetName][value] = (merged[facetName][value] || 0) + Number(count || 0);
        }
        continue;
      }

      // Array-style facets
      if (Array.isArray(facetData)) {
        const entry = facetData.find((f: any) => f?.field === facetName);
        if (entry?.buckets) {
          for (const bucket of entry.buckets) {
            const value = String(bucket.value || "").trim();
            const count = Number(bucket.count || 0);
            if (!value) continue;
            merged[facetName][value] = (merged[facetName][value] || 0) + count;
          }
        }
      }
    }
  }

  return merged;
}
