import type {
  AdapterIndexOptions,
  IndexSchema,
  SearchAdapter,
  SearchQuery,
  SearchResult,
} from "../../core/types";
import { createMeilisearchClient, type MeilisearchClient } from "./client";
import {
  fromMeilisearchFacets,
  toMeilisearchFacets,
  toMeilisearchFilter,
  toMeilisearchSort,
} from "./transforms";

export type MeilisearchAdapterConfig = {
  baseUrl: string;
  apiKey?: string;
  /** Inject a pre-built client (useful for testing). */
  client?: MeilisearchClient;
  /**
   * Wait for Meilisearch async tasks to complete before returning.
   * Disable for fire-and-forget writes. Default true.
   */
  waitForTasks?: boolean;
  /** Default ranking rules applied to all indexes. */
  rankingRules?: string[];
};

/**
 * Meilisearch search adapter.
 *
 * Features:
 * - Automatic index creation with searchable/filterable/sortable attributes
 * - All FilterCondition operators (=, !=, <, <=, >, >=, IN, NOT IN)
 * - Multi-field sort
 * - Facet distribution + numeric facet stats
 * - Hit highlighting with custom pre/post tags
 * - Vector/hybrid search (Meilisearch v1.6+ experimental)
 * - Async task polling for safe write operations
 * - deleteWhere via documents/delete API
 * - Index stats
 */
export function meilisearchAdapter(config: MeilisearchAdapterConfig): SearchAdapter {
  const client = config.client ?? createMeilisearchClient(config.baseUrl, config.apiKey);
  const wait = config.waitForTasks !== false;

  async function maybePoll(task: { taskUid: number }): Promise<void> {
    if (!wait) return;
    const result = await client.waitForTask(task.taskUid);
    if (result.status === "failed") {
      throw new Error(
        `Meilisearch task ${task.taskUid} failed: ${result.error?.message ?? "unknown"}`,
      );
    }
  }

  function buildSettings(schema: IndexSchema) {
    const searchable: string[] = [...(schema.fields ?? [])];
    const filterable: string[] = [];
    const sortable: string[] = [];
    const displayed: string[] = [...searchable];

    for (const [field, def] of Object.entries(schema.fieldMap ?? {})) {
      if (def.searchable !== false && !searchable.includes(field))
        searchable.push(field);
      if (def.filterable) filterable.push(field);
      if (def.sortable) sortable.push(field);
      if (def.stored !== false && !displayed.includes(field)) displayed.push(field);
    }

    return {
      searchableAttributes: searchable.length > 0 ? searchable : ["*"],
      filterableAttributes: filterable,
      sortableAttributes: sortable,
      displayedAttributes: displayed.length > 0 ? displayed : ["*"],
      rankingRules: schema.rankingRules ?? config.rankingRules,
      pagination: { maxTotalHits: schema.maxResults ?? 1000 },
    };
  }

  return {
    async setup(indexes: Record<string, IndexSchema>) {
      for (const [name, schema] of Object.entries(indexes)) {
        const task = await client
          .createIndex(name, { primaryKey: schema.primaryKey ?? "id" })
          .catch(() => null);
        if (task) await maybePoll(task);

        const settingsTask = await client.updateSettings(name, buildSettings(schema));
        await maybePoll(settingsTask);
      }
    },

    async index(indexName, docs, _options?: AdapterIndexOptions) {
      const task = await client.addDocuments(indexName, docs);
      await maybePoll(task);
    },

    async query(indexName, query: SearchQuery): Promise<SearchResult> {
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? query.limit ?? 20;

      const resp = await client.search(indexName, String(query.q ?? query.term ?? ""), {
        limit: pageSize,
        offset: (page - 1) * pageSize,
        filter: toMeilisearchFilter(query.filters),
        sort: toMeilisearchSort(query.sort),
        facets: toMeilisearchFacets(query.facets),
        attributesToHighlight: query.highlight?.fields,
        highlightPreTag: query.highlight?.preTag ?? "<em>",
        highlightPostTag: query.highlight?.postTag ?? "</em>",
        vector: query.vector,
        showRankingScore: true,
      });

      const highlights = query.highlight?.fields.length
        ? resp.hits.map(
            (h) => (h._formatted as Record<string, string[]> | undefined) ?? {},
          )
        : undefined;

      return {
        items: resp.hits as SearchResult["items"],
        total: resp.totalHits ?? resp.estimatedTotalHits ?? 0,
        page,
        pageSize,
        facets: fromMeilisearchFacets(resp.facetDistribution, resp.facetStats),
        highlights,
        took: resp.processingTimeMs,
      };
    },

    async delete(indexName, id) {
      const task = await client.deleteDocument(indexName, id);
      await maybePoll(task);
    },

    async deleteWhere(indexName, filters) {
      if (filters.length === 0) return 0;
      const filterStr = filters
        .map((c) => `${c.field} = ${JSON.stringify(c.value)}`)
        .join(" AND ");
      const task = await client.deleteDocumentsByFilter(indexName, filterStr);
      await maybePoll(task);
      return -1; // exact count not available from Meilisearch
    },

    async stats(indexName) {
      const s = await client.getStats(indexName);
      return { count: s.numberOfDocuments };
    },
  };
}
