import { runSearchPipeline } from "./pipeline";
import type {
  SearchAdapter,
  SearchLifecycleHooks,
  SearchMiddleware,
  SearchPlugin,
  SearchQuery,
  SearchResult,
} from "./types";
import { SearchQueryError, SearchError } from "./errors";

const MAX_PAGE_SIZE = 1000;
const DEFAULT_PAGE_SIZE = 20;
const MAX_QUERY_LENGTH = 2048;

/**
 * Sanitise and normalise an incoming SearchQuery.
 * Throws a SearchQueryError if validation fails.
 */
export function normalizeQuery(query: SearchQuery): SearchQuery {
  const q = String(query.q ?? query.term ?? "").slice(0, MAX_QUERY_LENGTH);
  const pageSize = Math.min(
    Math.max(1, ((query.pageSize ?? query.limit ?? DEFAULT_PAGE_SIZE) | 0)),
    MAX_PAGE_SIZE,
  );
  const page = Math.max(1, (query.page ?? 1) | 0);

  let sort = query.sort;
  if (sort && !Array.isArray(sort)) sort = [sort];
  if (Array.isArray(sort) && sort.length > 5) {
    throw new SearchQueryError("Maximum 5 sort criteria allowed per query");
  }

  return { ...query, q, page, pageSize, sort };
}

export async function executeQuery(args: {
  adapter: SearchAdapter;
  plugins: SearchPlugin[];
  indexName: string;
  query: SearchQuery;
  options?: Record<string, unknown>;
  middleware?: SearchMiddleware[];
  hooks?: SearchLifecycleHooks;
  timeoutMs?: number;
  signal?: AbortSignal;
}): Promise<SearchResult> {
  let normalized: SearchQuery;
  try {
    normalized = normalizeQuery(args.query);
  } catch (err) {
    if (err instanceof SearchError) throw err;
    throw new SearchQueryError("Invalid query", err);
  }
  return runSearchPipeline({ ...args, query: normalized });
}