// ---------------------------------------------------------------------------
// HTTP client with retry / backoff / circuit-breaker / deduplication
// ---------------------------------------------------------------------------

import type { SearchDocument, SearchQuery } from "../core/types";
import { SearchError, SEARCH_ERROR_CODES } from "../core/errors";
import type {
  SearchClientConfig,
  SearchClientResponse,
  BatchSearchRequest,
  BatchSearchResponse,
} from "./types";

type InFlight = Promise<unknown>;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Circuit-breaker state
type CircuitState = "closed" | "open" | "half-open";

export function createHttpClient(config: SearchClientConfig) {
  const {
    baseUrl,
    defaultIndex,
    apiKey,
    maxRetries = 3,
    baseRetryDelay = 100,
    timeoutMs = 10_000,
  } = config;

  const base = baseUrl.replace(/\/$/, "");

  // In-flight request deduplication map (GET requests only)
  const inFlight = new Map<string, InFlight>();

  // Circuit breaker
  let circuitState: CircuitState = "closed";
  let consecutiveErrors = 0;
  const CIRCUIT_OPEN_THRESHOLD = 5;
  const CIRCUIT_RECOVERY_MS = 30_000;

  function recordSuccess(): void {
    consecutiveErrors = 0;
    circuitState = "closed";
  }

  function recordFailure(): void {
    consecutiveErrors++;
    if (consecutiveErrors >= CIRCUIT_OPEN_THRESHOLD) {
      circuitState = "open";
      setTimeout(() => { circuitState = "half-open"; }, CIRCUIT_RECOVERY_MS);
    }
  }

  function buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    return headers;
  }

  async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  async function request<T>(
    method: "GET" | "POST",
    path: string,
    body?: unknown,
  ): Promise<T> {
    if (circuitState === "open") {
      throw new SearchError(
        SEARCH_ERROR_CODES.ADAPTER_ERROR,
        "Circuit breaker is open — search service unavailable",
        { status: 503 },
      );
    }

    const url = `${base}${path}`;
    const key = `${method}:${url}${body ? `:${JSON.stringify(body)}` : ""}`;

    // Deduplicate identical in-flight GET requests
    if (method === "GET" && inFlight.has(key)) {
      return inFlight.get(key) as Promise<T>;
    }

    const attempt = async (): Promise<T> => {
      let lastError: Error | null = null;

      for (let i = 0; i <= maxRetries; i++) {
        try {
          const res = await fetchWithTimeout(url, {
            method,
            headers: buildHeaders(),
            body: body !== undefined ? JSON.stringify(body) : undefined,
          });

          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new SearchError(
              SEARCH_ERROR_CODES.ADAPTER_ERROR,
              `HTTP ${res.status}: ${text}`,
              { status: res.status },
            );
          }

          recordSuccess();
          return (await res.json()) as T;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));

          // Non-retryable: 4xx errors
          if (err instanceof SearchError && err.status >= 400 && err.status < 500) {
            recordFailure();
            throw err;
          }

          if (i < maxRetries) {
            await sleep(baseRetryDelay * 2 ** i);
          }
        }
      }

      recordFailure();
      throw lastError ?? new SearchError(SEARCH_ERROR_CODES.ADAPTER_ERROR, "Unknown error");
    };

    const promise = attempt();

    if (method === "GET") {
      inFlight.set(key, promise);
      promise.finally(() => inFlight.delete(key));
    }

    return promise as Promise<T>;
  }

  return {
    /**
     * Execute a single search query against a named index.
     */
    async search<T extends SearchDocument>(
      query: SearchQuery & { index?: string },
    ): Promise<SearchClientResponse<T>> {
      const indexName = query.index ?? defaultIndex;
      if (!indexName) throw new SearchError(SEARCH_ERROR_CODES.INVALID_CONFIG, "No index specified");

      const start = Date.now();
      const result = await request<SearchClientResponse<T>>(
        "POST",
        `/search/${encodeURIComponent(indexName)}`,
        query,
      );
      result._clientMs = Date.now() - start;
      return result;
    },

    /**
     * Execute multiple search queries in a single HTTP round trip.
     */
    async batchSearch<T extends SearchDocument>(
      req: BatchSearchRequest,
    ): Promise<BatchSearchResponse<T>> {
      const start = Date.now();
      const result = await request<BatchSearchResponse<T>>("POST", "/search/_batch", req);
      const elapsed = Date.now() - start;
      for (const r of result.results) {
        (r as SearchClientResponse<T>)._clientMs = elapsed;
      }
      return result;
    },

    /** Expose circuit breaker state for health checks. */
    get circuitState(): CircuitState {
      return circuitState;
    },
  };
}

export type SearchHttpClient = ReturnType<typeof createHttpClient>;
