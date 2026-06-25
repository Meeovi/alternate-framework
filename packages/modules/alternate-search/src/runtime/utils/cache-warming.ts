import type { IndexSchema, SearchInstance, SearchQuery } from "../../core/types";

export type CacheWarmRequest<TIndexes extends Record<string, IndexSchema>> = {
  indexName: keyof TIndexes & string;
  query: SearchQuery;
};

export type CacheWarmOptions = {
  concurrency?: number;
  continueOnError?: boolean;
};

export type CacheWarmResult = {
  total: number;
  succeeded: number;
  failed: number;
  errors: Array<{
    indexName: string;
    query: SearchQuery;
    message: string;
  }>;
};

export async function warmSearchCache<TIndexes extends Record<string, IndexSchema>>(
  search: SearchInstance<TIndexes>,
  requests: CacheWarmRequest<TIndexes>[],
  options: CacheWarmOptions = {},
): Promise<CacheWarmResult> {
  const concurrency = Math.max(1, options.concurrency ?? 4);
  const continueOnError = options.continueOnError ?? true;

  const queue = [...requests];
  const errors: CacheWarmResult["errors"] = [];
  let succeeded = 0;

  async function worker(): Promise<void> {
    for (;;) {
      const next = queue.shift();
      if (!next) return;
      try {
        await search.query(next.indexName, next.query);
        succeeded += 1;
      } catch (error) {
        errors.push({
          indexName: next.indexName,
          query: next.query,
          message: error instanceof Error ? error.message : String(error),
        });
        if (!continueOnError) {
          throw error;
        }
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, requests.length || 1) }, () => worker()));

  return {
    total: requests.length,
    succeeded,
    failed: errors.length,
    errors,
  };
}
