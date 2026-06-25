import type { SearchAdapter, SearchLifecycleHooks, SearchMiddleware, SearchPlugin, SearchQuery, SearchResult } from "./types";
/**
 * Sanitise and normalise an incoming SearchQuery.
 * Throws a SearchQueryError if validation fails.
 */
export declare function normalizeQuery(query: SearchQuery): SearchQuery;
export declare function executeQuery(args: {
    adapter: SearchAdapter;
    plugins: SearchPlugin[];
    indexName: string;
    query: SearchQuery;
    options?: Record<string, unknown>;
    middleware?: SearchMiddleware[];
    hooks?: SearchLifecycleHooks;
    timeoutMs?: number;
    signal?: AbortSignal;
}): Promise<SearchResult>;
