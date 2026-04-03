// ---------------------------------------------------------------------------
// Client-side types for the HTTP search client
// ---------------------------------------------------------------------------

import type { SearchQuery, SearchResult, SearchDocument } from "../core/types";

export type SearchClientConfig = {
  /** Base URL of the search gateway HTTP API. */
  baseUrl: string;
  /** Default index name to use when one is not provided in the query. */
  defaultIndex?: string;
  /** Bearer token or API key for authentication. */
  apiKey?: string;
  /**
   * Number of times to retry a failed request before throwing.
   * Default: 3.
   */
  maxRetries?: number;
  /**
   * Base delay in milliseconds for exponential backoff.
   * Delay = baseRetryDelay * 2^attempt.
   * Default: 100.
   */
  baseRetryDelay?: number;
  /** Request timeout in milliseconds. Default: 10 000. */
  timeoutMs?: number;
};

export type SearchClientResponse<T extends SearchDocument = SearchDocument> = SearchResult<T> & {
  /** Wall-clock time for the HTTP round trip in milliseconds. */
  _clientMs: number;
};

export type BatchSearchRequest = {
  queries: Array<SearchQuery & { index?: string }>;
};

export type BatchSearchResponse<T extends SearchDocument = SearchDocument> = {
  results: SearchClientResponse<T>[];
};
