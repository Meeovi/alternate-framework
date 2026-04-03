import type {
  AdapterIndexOptions,
  FilterCondition,
  IndexSchema,
  SearchAdapter,
  SearchQuery,
  SearchResult,
} from "../../core/types";

/**
 * Configuration for a single backend in the multi-backend adapter.
 */
export interface BackendConfig {
  /** Unique identifier for this backend. */
  id: string;
  /** The search adapter instance for this backend. */
  adapter: SearchAdapter;
  /** Priority: lower number = higher priority. Defaults to 50. */
  priority?: number;
  /** If true, backend failure does not fail the whole query. */
  optional?: boolean;
  /** Weight for merged ranking in [0..100]. Defaults to 50. */
  weight?: number;
  /** Maximum results fetched from this backend per query. */
  maxResults?: number;
  /** Backend-specific timeout in milliseconds. */
  timeoutMs?: number;
}

export type CircuitBreakerConfig = {
  /** Consecutive failures before opening the circuit. Default: 3. */
  failureThreshold?: number;
  /** Open duration before probing again. Default: 30_000 ms. */
  cooldownMs?: number;
  /** Allowed probe requests when cooldown elapses. Default: 1. */
  probeRequests?: number;
  /** Return stale cached result or empty result while open. Default: "empty". */
  fallbackResult?: "empty" | "cached";
};

/**
 * Configuration for the multi-backend adapter.
 */
export interface MultiBackendAdapterConfig {
  /** Array of configured backends. */
  backends: BackendConfig[];
  /** Default max results per backend if not specified (default: 100). */
  defaultMaxResults?: number;
  /** Default timeout per backend in milliseconds (default: 10_000). */
  defaultTimeoutMs?: number;
  /** How to aggregate: "merge" (blend) or "cascade" (first success). */
  aggregationStrategy?: "merge" | "cascade";
  /** If true, run all backend queries concurrently. Default true. */
  parallel?: boolean;
  /** Enable verbose logs. */
  debug?: boolean;
  /** Circuit-breaker behavior for backend resilience. */
  circuitBreaker?: CircuitBreakerConfig;
  /**
   * Primary-to-fallback backend chain.
   * Example: { elasticsearch: ["sqlite"] }
   */
  fallbackChains?: Record<string, string[]>;
}

type NormalizedBackend = BackendConfig & {
  priority: number;
  optional: boolean;
  weight: number;
  timeout: number;
  maxResults: number;
};

type CircuitState = {
  failures: number;
  openUntil: number;
  probesLeft: number;
  lastSuccessAt?: number;
  lastErrorAt?: number;
  cachedResult?: SearchResult;
};

interface QueryContext {
  indexName: string;
  query: SearchQuery;
  backends: NormalizedBackend[];
}

interface BackendResult {
  backendId: string;
  servedBy: string;
  result: SearchResult | null;
  error: Error | null;
  elapsed: number;
  circuitOpen?: boolean;
  fromCache?: boolean;
}

const EMPTY_RESULT: SearchResult = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 0,
  facets: [],
  took: 0,
};

export function multiBackendAdapter(config: MultiBackendAdapterConfig): SearchAdapter {
  if (!config.backends || config.backends.length === 0) {
    throw new Error("MultiBackendAdapter requires at least one backend");
  }

  const defaultMaxResults = config.defaultMaxResults ?? 100;
  const defaultTimeoutMs = config.defaultTimeoutMs ?? 10_000;
  const aggregationStrategy = config.aggregationStrategy ?? "merge";
  const parallel = config.parallel ?? true;
  const debug = config.debug ?? false;

  const circuit: Required<CircuitBreakerConfig> = {
    failureThreshold: config.circuitBreaker?.failureThreshold ?? 3,
    cooldownMs: config.circuitBreaker?.cooldownMs ?? 30_000,
    probeRequests: config.circuitBreaker?.probeRequests ?? 1,
    fallbackResult: config.circuitBreaker?.fallbackResult ?? "empty",
  };

  const normalizedBackends: NormalizedBackend[] = config.backends.map((backend) => ({
    ...backend,
    priority: backend.priority ?? 50,
    optional: backend.optional ?? false,
    weight: backend.weight ?? 50,
    timeout: backend.timeoutMs ?? defaultTimeoutMs,
    maxResults: backend.maxResults ?? defaultMaxResults,
  }));

  const backendMap = new Map(normalizedBackends.map((backend) => [backend.id, backend]));
  const backendsByPriority = [...normalizedBackends].sort((a, b) => a.priority - b.priority);
  const state = new Map<string, CircuitState>();

  const log = (message: string, meta?: Record<string, unknown>) => {
    if (!debug) return;
    const ts = new Date().toISOString();
    // eslint-disable-next-line no-console
    console.log(`[MultiBackendAdapter ${ts}] ${message}`, meta ?? "");
  };

  const getState = (backendId: string): CircuitState => {
    const existing = state.get(backendId);
    if (existing) return existing;
    const created: CircuitState = {
      failures: 0,
      openUntil: 0,
      probesLeft: 0,
    };
    state.set(backendId, created);
    return created;
  };

  const isCircuitOpen = (backendId: string): boolean => {
    const now = Date.now();
    const s = getState(backendId);

    if (s.openUntil > now) {
      return true;
    }

    if (s.openUntil > 0 && now >= s.openUntil && s.probesLeft <= 0) {
      s.probesLeft = circuit.probeRequests;
    }

    if (s.probesLeft > 0) {
      s.probesLeft -= 1;
      return false;
    }

    return false;
  };

  const onSuccess = (backendId: string, result: SearchResult) => {
    const s = getState(backendId);
    s.failures = 0;
    s.openUntil = 0;
    s.probesLeft = 0;
    s.lastSuccessAt = Date.now();
    s.cachedResult = result;
  };

  const onFailure = (backendId: string) => {
    const s = getState(backendId);
    s.failures += 1;
    s.lastErrorAt = Date.now();
    if (s.failures >= circuit.failureThreshold) {
      s.openUntil = Date.now() + circuit.cooldownMs;
      s.probesLeft = 0;
      log("Circuit opened", {
        backendId,
        failures: s.failures,
        openUntil: s.openUntil,
      });
    }
  };

  const queryWithTimeout = async (
    backend: NormalizedBackend,
    indexName: string,
    query: SearchQuery,
  ): Promise<SearchResult> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), backend.timeout);
    try {
      const result = await Promise.race([
        backend.adapter.query(indexName, query),
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener("abort", () => {
            reject(new Error(`Backend ${backend.id} timeout after ${backend.timeout}ms`));
          });
        }),
      ]);
      return result;
    } finally {
      clearTimeout(timeout);
    }
  };

  const buildBackendQuery = (backend: NormalizedBackend, query: SearchQuery): SearchQuery => {
    const pageSize = query.pageSize ?? query.limit;
    const boundedPageSize = pageSize ? Math.min(pageSize, backend.maxResults) : backend.maxResults;
    return {
      ...query,
      pageSize: boundedPageSize,
      limit: boundedPageSize,
    };
  };

  const querySingleBackend = async (
    backend: NormalizedBackend,
    indexName: string,
    query: SearchQuery,
    primaryBackendId: string,
  ): Promise<BackendResult> => {
    const started = Date.now();

    if (isCircuitOpen(backend.id)) {
      const s = getState(backend.id);
      const fallbackResult =
        circuit.fallbackResult === "cached" && s.cachedResult
          ? s.cachedResult
          : EMPTY_RESULT;

      return {
        backendId: primaryBackendId,
        servedBy: backend.id,
        result: fallbackResult,
        error: null,
        elapsed: Date.now() - started,
        circuitOpen: true,
        fromCache: circuit.fallbackResult === "cached" && Boolean(s.cachedResult),
      };
    }

    try {
      const result = await queryWithTimeout(backend, indexName, buildBackendQuery(backend, query));
      onSuccess(backend.id, result);
      return {
        backendId: primaryBackendId,
        servedBy: backend.id,
        result,
        error: null,
        elapsed: Date.now() - started,
      };
    } catch (error) {
      onFailure(backend.id);
      return {
        backendId: primaryBackendId,
        servedBy: backend.id,
        result: null,
        error: error instanceof Error ? error : new Error(String(error)),
        elapsed: Date.now() - started,
      };
    }
  };

  const queryWithFallback = async (
    backend: NormalizedBackend,
    indexName: string,
    query: SearchQuery,
  ): Promise<BackendResult> => {
    const chain = [backend.id, ...(config.fallbackChains?.[backend.id] ?? [])];
    let lastFailure: BackendResult | null = null;

    for (const backendId of chain) {
      const candidate = backendMap.get(backendId);
      if (!candidate) continue;

      const result = await querySingleBackend(candidate, indexName, query, backend.id);
      if (result.result) {
        return result;
      }

      lastFailure = result;
      log("Backend attempt failed", {
        primary: backend.id,
        attempted: backendId,
        error: result.error?.message,
      });
    }

    return (
      lastFailure ?? {
        backendId: backend.id,
        servedBy: backend.id,
        result: null,
        error: new Error(`No backend available for ${backend.id}`),
        elapsed: 0,
      }
    );
  };

  const queryParallel = async (ctx: QueryContext): Promise<BackendResult[]> => {
    log("Executing parallel queries", {
      backends: ctx.backends.map((backend) => backend.id),
      indexName: ctx.indexName,
    });

    const settled = await Promise.allSettled(
      ctx.backends.map((backend) => queryWithFallback(backend, ctx.indexName, ctx.query)),
    );

    return settled.map((entry, index) => {
      if (entry.status === "fulfilled") return entry.value;
      return {
        backendId: ctx.backends[index].id,
        servedBy: ctx.backends[index].id,
        result: null,
        error: entry.reason instanceof Error ? entry.reason : new Error(String(entry.reason)),
        elapsed: 0,
      };
    });
  };

  const queryCascade = async (ctx: QueryContext): Promise<BackendResult[]> => {
    log("Executing cascade queries", {
      backends: ctx.backends.map((backend) => backend.id),
      indexName: ctx.indexName,
    });

    const results: BackendResult[] = [];

    for (const backend of ctx.backends) {
      const result = await queryWithFallback(backend, ctx.indexName, ctx.query);
      results.push(result);

      if (result.result) {
        log("Cascade resolved", {
          backendId: backend.id,
          servedBy: result.servedBy,
          circuitOpen: result.circuitOpen === true,
        });
        break;
      }
    }

    return results;
  };

  const mergeResults = (results: BackendResult[]): SearchResult => {
    const successes = results.filter((entry) => entry.result !== null) as Array<
      BackendResult & { result: SearchResult }
    >;

    if (successes.length === 0) return { ...EMPTY_RESULT };
    if (successes.length === 1) return successes[0].result;

    type RankedItem = Record<string, unknown> & { _score?: number; _source?: string };

    const merged: RankedItem[] = [];
    const facetMap = new Map<string, Map<string, number>>();
    let weightedTotal = 0;

    for (const success of successes) {
      const backend = backendMap.get(success.backendId);
      const weight = (backend?.weight ?? 50) / 100;

      success.result.items.forEach((item, index) => {
        const score = ((success.result.items.length - index) / Math.max(1, success.result.items.length)) * weight;
        merged.push({
          ...(item as Record<string, unknown>),
          _source: success.servedBy,
          _score: score,
        });
      });

      weightedTotal += success.result.total * weight;

      success.result.facets?.forEach((facet) => {
        if (!facetMap.has(facet.field)) facetMap.set(facet.field, new Map());
        const values = facetMap.get(facet.field)!;
        facet.values.forEach((value) => {
          const key = String(value.value);
          values.set(key, (values.get(key) ?? 0) + value.count * weight);
        });
      });
    }

    merged.sort((a, b) => (Number(b._score ?? 0) - Number(a._score ?? 0)));

    const pageSize = successes[0].result.pageSize;
    const page = successes[0].result.page;

    const facets = [...facetMap.entries()].map(([field, values]) => ({
      field,
      values: [...values.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
    }));

    return {
      items: merged.slice(0, pageSize),
      total: Math.ceil(weightedTotal),
      page,
      pageSize,
      facets,
      took: Math.max(...successes.map((entry) => entry.result.took ?? 0)),
    };
  };

  const selectCascadeResult = (results: BackendResult[]): SearchResult => {
    const success = results.find((entry) => entry.result !== null) as
      | (BackendResult & { result: SearchResult })
      | undefined;

    return success?.result ?? { ...EMPTY_RESULT };
  };

  return {
    async setup(indexes: Record<string, IndexSchema>) {
      log("Setting up all backends", { backends: normalizedBackends.map((backend) => backend.id) });

      const settled = await Promise.allSettled(normalizedBackends.map((backend) => backend.adapter.setup(indexes)));
      const failures = settled
        .map((entry, index) => (entry.status === "rejected" ? normalizedBackends[index].id : null))
        .filter((value): value is string => value !== null);

      const requiredFailures = failures.filter((backendId) => !backendMap.get(backendId)?.optional);
      if (requiredFailures.length > 0) {
        throw new Error(`Failed to setup required backends: ${requiredFailures.join(", ")}`);
      }

      if (failures.length > 0) {
        log("Optional backends failed setup", { backends: failures });
      }
    },

    async index(indexName: string, docs: any[], options?: AdapterIndexOptions) {
      log("Indexing documents", {
        indexName,
        count: docs.length,
        backends: normalizedBackends.map((backend) => backend.id),
      });

      const settled = await Promise.allSettled(
        normalizedBackends.map((backend) => backend.adapter.index(indexName, docs, options)),
      );

      const failures = settled
        .map((entry, index) => (entry.status === "rejected" ? normalizedBackends[index].id : null))
        .filter((value): value is string => value !== null);

      const requiredFailures = failures.filter((backendId) => !backendMap.get(backendId)?.optional);
      if (requiredFailures.length > 0) {
        throw new Error(`Failed to index in required backends: ${requiredFailures.join(", ")}`);
      }

      if (failures.length > 0) {
        log("Optional backends failed indexing", { backends: failures });
      }
    },

    async query(indexName: string, query: SearchQuery): Promise<SearchResult> {
      const ctx: QueryContext = {
        indexName,
        query,
        backends: backendsByPriority,
      };

      log("Multi-backend query started", {
        indexName,
        q: query.q ?? query.term,
        strategy: parallel ? "parallel" : "cascade",
      });

      const backendResults = parallel ? await queryParallel(ctx) : await queryCascade(ctx);

      const requiredErrors = backendResults.filter((entry) => {
        const backend = backendMap.get(entry.backendId);
        return Boolean(entry.error) && !backend?.optional;
      });

      if (requiredErrors.length > 0 && aggregationStrategy === "cascade") {
        throw new Error(
          `Required backends failed: ${requiredErrors.map((entry) => entry.backendId).join(", ")}`,
        );
      }

      const result = aggregationStrategy === "merge" ? mergeResults(backendResults) : selectCascadeResult(backendResults);

      if (debug || query._options?.debug === true) {
        (result as Record<string, unknown>)._backendTimings = backendResults.map((entry) => ({
          backendId: entry.backendId,
          servedBy: entry.servedBy,
          elapsed: entry.elapsed,
          success: !entry.error,
          circuitOpen: entry.circuitOpen === true,
          fromCache: entry.fromCache === true,
          took: entry.result?.took,
        }));

        (result as Record<string, unknown>)._backendErrors = backendResults
          .filter((entry) => entry.error)
          .map((entry) => ({
            backendId: entry.backendId,
            servedBy: entry.servedBy,
            message: entry.error?.message,
          }));
      }

      log("Multi-backend query completed", {
        indexName,
        items: result.items.length,
        total: result.total,
        took: result.took,
      });

      return result;
    },

    async delete(indexName: string, id: string) {
      const settled = await Promise.allSettled(normalizedBackends.map((backend) => backend.adapter.delete(indexName, id)));
      const failures = settled
        .map((entry, index) => (entry.status === "rejected" ? normalizedBackends[index].id : null))
        .filter((value): value is string => value !== null);

      const requiredFailures = failures.filter((backendId) => !backendMap.get(backendId)?.optional);
      if (requiredFailures.length > 0) {
        throw new Error(`Failed to delete in required backends: ${requiredFailures.join(", ")}`);
      }
    },

    async deleteWhere(indexName: string, filters: FilterCondition[]): Promise<number> {
      const settled = await Promise.allSettled(
        normalizedBackends.map((backend) => backend.adapter.deleteWhere?.(indexName, filters) ?? Promise.resolve(0)),
      );

      let deleted = 0;
      const failures: string[] = [];
      settled.forEach((entry, index) => {
        if (entry.status === "fulfilled") {
          deleted += entry.value;
        } else {
          failures.push(normalizedBackends[index].id);
        }
      });

      const requiredFailures = failures.filter((backendId) => !backendMap.get(backendId)?.optional);
      if (requiredFailures.length > 0) {
        throw new Error(`Failed to deleteWhere in required backends: ${requiredFailures.join(", ")}`);
      }

      return deleted;
    },

    async stats(indexName: string): Promise<{ count: number; size?: number }> {
      const settled = await Promise.allSettled(
        normalizedBackends.map((backend) => backend.adapter.stats?.(indexName) ?? Promise.resolve({ count: 0 })),
      );

      let count = 0;
      let size = 0;
      settled.forEach((entry) => {
        if (entry.status !== "fulfilled") return;
        count += entry.value.count;
        if (entry.value.size) size += entry.value.size;
      });

      return {
        count,
        size: size > 0 ? size : undefined,
      };
    },
  };
}

export type { BackendConfig, MultiBackendAdapterConfig };
