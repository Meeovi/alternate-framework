import { SearchConfigError } from "./errors";
import { createIndexManager } from "./index-manager";
import { executeQuery } from "./query-engine";
import type {
  AdapterIndexOptions,
  FilterCondition,
  IndexSchema,
  SearchConfig,
  SearchConversionAnalyticsEvent,
  SearchDocument,
  SearchFederatedOptions,
  SearchFederatedResult,
  SearchInstance,
  SearchMultiResult,
  SearchMultiStreamChunk,
  SearchQuery,
  SearchClickAnalyticsEvent,
} from "./types";
import { createAnalyticsBridge } from "../analytics/index";

/**
 * Create a fully configured search instance.
 *
 * Follows the same factory pattern as `betterAuth` \u2014 you pass a config object
 * containing an adapter, index schemas, and optional plugins, and receive a
 * typed `SearchInstance` with `setup`, `query`, `index`, `delete`, `deleteWhere`,
 * and `stats`.
 *
 * @example
 * ```ts
 * const search = createSearch({
 *   adapter: meilisearchAdapter({ baseUrl: process.env.MEILI_URL! }),
 *   indexes: {
 *     products: { fields: ["title", "description", "tags"], vectorize: true },
 *   },
 *   plugins: [
 *     semanticSearch(),
 *     autocomplete(),
 *     multitenancy({ tenantId: "acme" }),
 *   ],
 * });
 *
 * await search.setup();
 * const results = await search.query("products", { q: "running shoes" });
 * ```
 */
type SearchIndexes = Record<string, IndexSchema>;

function mergeFilters(
  base: SearchQuery["filters"],
  patch: SearchQuery["filters"],
): SearchQuery["filters"] {
  if (!base) return patch;
  if (!patch) return base;

  const toArray = (filters: SearchQuery["filters"]): FilterCondition[] => {
    if (!filters) return [];
    if (Array.isArray(filters)) return filters;
    return Object.entries(filters).map(([field, value]) => ({ field, operator: "=", value }));
  };

  return [...toArray(base), ...toArray(patch)];
}

function normalizeIndexName(indexPrefix: string, aliases: Record<string, string>, indexName: string): string {
  const alias = aliases[indexName] ?? indexName;
  return `${indexPrefix}${alias}`;
}

function reciprocalRankFusion<T>(
  lists: Array<{ indexName: string; items: T[] }>,
  options: SearchFederatedOptions = {},
): SearchFederatedResult<T> {
  const rrfK = options.rrfK ?? 60;
  const limit = options.limit ?? 50;

  const scoreMap = new Map<string, { indexName: string; item: T; score: number }>();

  for (const list of lists) {
    list.items.forEach((item, position) => {
      const id = String((item as Record<string, unknown>).id ?? `${list.indexName}:${position}`);
      const key = `${list.indexName}:${id}`;
      const existing = scoreMap.get(key);
      const score = 1 / (rrfK + position + 1);
      if (existing) {
        existing.score += score;
      } else {
        scoreMap.set(key, {
          indexName: list.indexName,
          item,
          score,
        });
      }
    });
  }

  const fusedItems = [...scoreMap.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry, index) => ({
      indexName: entry.indexName,
      item: entry.item,
      score: entry.score,
      rank: index + 1,
    }));

  return {
    items: fusedItems,
    total: fusedItems.length,
  };
}

export function createSearch<TIndexes extends SearchIndexes>(
  config: SearchConfig & { indexes: TIndexes },
): SearchInstance<TIndexes> {
  if (!config.adapter) {
    throw new SearchConfigError("createSearch requires an adapter");
  }
  if (!config.indexes || Object.keys(config.indexes).length === 0) {
    throw new SearchConfigError("createSearch requires at least one index schema");
  }

  const plugins = config.plugins ?? [];
  const middleware = config.middleware ?? [];
  const hooks = config.hooks;
  const logger = config.logger;
  const timeoutMs = config.queryTimeoutMs ?? 10_000;
  const analytics = createAnalyticsBridge(config.analytics);
  const indexPrefix = config.indexPrefix ?? "";
  const indexAliases = config.indexAliases ?? {};
  const virtualIndexes = config.virtualIndexes ?? {};

  function resolveIndex(indexName: string): { physical: string; virtualFilters?: SearchQuery["filters"] } {
    const virtual = virtualIndexes[indexName];
    if (virtual) {
      return {
        physical: normalizeIndexName(indexPrefix, indexAliases, virtual.sourceIndex),
        virtualFilters: virtual.filters,
      };
    }

    return {
      physical: normalizeIndexName(indexPrefix, indexAliases, indexName),
    };
  }

  const resolvedIndexes = Object.fromEntries(
    Object.entries(config.indexes).map(([indexName, schema]) => [
      normalizeIndexName(indexPrefix, indexAliases, indexName),
      schema,
    ]),
  );

  const manager = createIndexManager({
    adapter: config.adapter,
    plugins,
    indexes: resolvedIndexes,
    batchSize: config.indexBatchSize,
  });

  return {
    async setup() {
      logger?.info("Setting up search", { indexes: Object.keys(resolvedIndexes) });
      await manager.setup();
      logger?.info("Search setup complete");
    },

    async index(indexName: string, docs: SearchDocument[], options?: AdapterIndexOptions) {
      const { physical } = resolveIndex(indexName);
      logger?.debug("Indexing documents", { indexName, physicalIndex: physical, count: docs.length });
      await manager.index(physical, docs, options);
    },

    async query(indexName: string, query: SearchQuery, signal?: AbortSignal) {
      const resolved = resolveIndex(indexName);
      const effectiveQuery: SearchQuery = {
        ...query,
        filters: mergeFilters(query.filters, resolved.virtualFilters),
      };

      logger?.debug("Executing query", { indexName, physicalIndex: resolved.physical, q: query.q ?? query.term });
      const start = Date.now();
      try {
        const result = await executeQuery({
          adapter: config.adapter,
          plugins,
          indexName: resolved.physical,
          query: effectiveQuery,
          middleware,
          hooks,
          timeoutMs,
          signal,
        });

        logger?.debug("Query complete", {
          indexName,
          total: result.total,
          took: Date.now() - start,
        });

        await analytics.trackPerformed({
          requestId: crypto.randomUUID(),
          indexName,
          query: String(effectiveQuery.q ?? effectiveQuery.term ?? ""),
          userId: effectiveQuery.userId,
          tenantId: effectiveQuery.tenantId,
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          took: result.took,
          backend: typeof result.items?.[0] === "object" ? String((result.items[0] as Record<string, unknown>)?._source ?? "") || undefined : undefined,
        });

        return result;
      } catch (error) {
        await analytics.trackError({
          requestId: crypto.randomUUID(),
          indexName,
          query: String(effectiveQuery.q ?? effectiveQuery.term ?? ""),
          userId: effectiveQuery.userId,
          tenantId: effectiveQuery.tenantId,
          errorCode: error instanceof Error && "code" in error ? String((error as { code?: string }).code ?? "") || undefined : undefined,
          message: error instanceof Error ? error.message : String(error),
          status: error instanceof Error && "status" in error ? Number((error as { status?: number }).status) || undefined : undefined,
        });
        throw error;
      }
    },

    async queryMany(indexRequests, signal) {
      return Promise.all(
        indexRequests.map(async ({ indexName, query }) => ({
          indexName,
          result: await this.query(indexName, query, signal),
        })),
      ) as Promise<SearchMultiResult<TIndexes>[]>;
    },

    async *queryManyStream(indexRequests, signal) {
      type StreamIndexName = keyof TIndexes & string;

      const pending = new Map<number, Promise<SearchMultiStreamChunk<TIndexes, StreamIndexName>>>();

      indexRequests.forEach(({ indexName, query }, idx) => {
        const task = this.query(indexName, query, signal)
          .then((result) => ({ indexName: indexName as StreamIndexName, result }))
          .catch((error) => ({
            indexName: indexName as StreamIndexName,
            error: error instanceof Error ? error : new Error(String(error)),
          }));
        pending.set(idx, task);
      });

      while (pending.size > 0) {
        const wrapped = [...pending.entries()].map(([id, task]) =>
          task.then((chunk) => ({ id, chunk })),
        );
        const settled = await Promise.race(wrapped);
        pending.delete(settled.id);
        yield settled.chunk;
      }
    },

    async queryFederated(indexRequests, options, signal) {
      const multiResults = await this.queryMany(indexRequests, signal);
      const fused = reciprocalRankFusion(
        multiResults.map(({ indexName, result }) => ({
          indexName,
          items: result.items,
        })),
        options,
      );

      fused.took = multiResults
        .map(({ result }) => result.took ?? 0)
        .reduce((max, took) => Math.max(max, took), 0);

      return fused;
    },

    async trackClick(event) {
      await analytics.trackClick(event as Omit<SearchClickAnalyticsEvent, "event" | "timestamp">);
    },

    async trackConversion(event) {
      await analytics.trackConversion(event as Omit<SearchConversionAnalyticsEvent, "event" | "timestamp">);
    },

    async delete(indexName: string, id: string) {
      const { physical } = resolveIndex(indexName);
      logger?.debug("Deleting document", { indexName, physicalIndex: physical, id });
      await manager.delete(physical, id);
    },

    async deleteWhere(indexName: string, filters: FilterCondition[]) {
      const { physical } = resolveIndex(indexName);
      return manager.deleteWhere(physical, filters);
    },

    async stats(indexName: string) {
      const { physical } = resolveIndex(indexName);
      return manager.stats(physical);
    },
  };
}