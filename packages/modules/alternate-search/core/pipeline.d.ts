import type { SearchAdapter, SearchLifecycleHooks, SearchMiddleware, SearchPlugin, SearchQuery, SearchResult } from "./types";
export declare function runSearchPipeline(args: {
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
