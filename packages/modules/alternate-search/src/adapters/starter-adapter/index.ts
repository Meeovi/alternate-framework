import type {
  AdapterIndexOptions,
  FacetRequest,
  FacetResult,
  FacetValue,
  FilterCondition,
  IndexSchema,
  SearchAdapter,
  SearchDocument,
  SearchQuery,
  SearchResult,
} from "../../core/types";

// ---------------------------------------------------------------------------
// Starter Adapter Template
// ---------------------------------------------------------------------------

/**
 * Configuration for your custom search adapter.
 *
 * This template shows the minimal requirements for creating a custom adapter.
 * Extend this interface with any backend-specific configuration options.
 */
export type StarterAdapterConfig = {
  /** Required connection URL or identifier. */
  endpoint: string;
  /** Optional API key or credentials. */
  apiKey?: string;
  /** Optional timeout in milliseconds for operations. */
  timeoutMs?: number;
  /** Optional custom client instance (useful for testing or dependency injection). */
  client?: StarterAdapterClient;
};

/**
 * Minimal client interface that your adapter requires.
 *
 * Implement this with your actual backend client (e.g., official SDK or fetch wrapper).
 */
export type StarterAdapterClient = {
  /** Create or verify an index exists. Called once during setup. */
  ensureIndex(indexName: string, schema: IndexSchema): Promise<void>;
  /** Add or update documents in the index. */
  upsert(indexName: string, docs: SearchDocument[]): Promise<void>;
  /** Execute a search query and return results. */
  search(indexName: string, query: SearchQuery): Promise<SearchResult>;
  /** Delete a document by ID. */
  remove(indexName: string, id: string): Promise<void>;
  /** Get document count for stats. */
  count(indexName: string): Promise<number>;
};

/**
 * Create a client instance for the starter adapter.
 * Replace with your actual backend client implementation.
 */
function createStarterClient(
  endpoint: string,
  apiKey?: string,
): StarterAdapterClient {
  return {
    async ensureIndex(_indexName) {
      // No-op: implement index creation in your backend
    },
    async upsert(_indexName, _docs) {
      // No-op: implement document indexing
    },
    async search(_indexName, _query) {
      return {
        items: [],
        total: 0,
        page: _query.page ?? 1,
        pageSize: _query.pageSize ?? _query.limit ?? 20,
        took: 0,
      };
    },
    async remove(_indexName, _id) {
      // No-op: implement document deletion
    },
    async count(_indexName) {
      return 0;
    },
  };
}

/**
 * Starter adapter template for building custom search backends.
 *
 * Features demonstrated:
 * - Index setup with schema
 * - Document indexing (upsert)
 * - Full-text search query
 * - Filter conditions (=, !=, <, <=, >, >=, IN, NOT IN)
 * - Pagination
 * - Faceted search
 * - Document deletion
 * - Index statistics
 *
 * To create your own adapter:
 * 1. Define your config type (extending StarterAdapterConfig)
 * 2. Implement the client interface methods
 * 3. Map your backend's query format to SearchQuery
 * 4. Map your backend's results to SearchResult
 *
 * @example
 * ```ts
 * // Implement your actual client
 * const client = createMyBackendClient(config.endpoint, config.apiKey);
 *
 * // Use the adapter
 * const adapter = starterAdapter({ endpoint: "https://api.example.com" });
 * await adapter.setup({ products: { fields: ["name", "description"] } });
 * await adapter.index("products", [{ id: "1", name: "Widget", description: "..." }]);
 * const results = await adapter.query("products", { q: "widget", limit: 10 });
 * ```
 */
export function starterAdapter(config: StarterAdapterConfig): SearchAdapter {
  const client = config.client ?? createStarterClient(config.endpoint, config.apiKey);

  return {
    async setup(indexes: Record<string, IndexSchema>) {
      for (const [name, schema] of Object.entries(indexes)) {
        await client.ensureIndex(name, schema);
      }
    },

    async index(indexName, docs, options?: AdapterIndexOptions) {
      await client.upsert(indexName, docs);
    },

    async query(indexName, query: SearchQuery): Promise<SearchResult> {
      return client.search(indexName, query);
    },

    async delete(indexName, id) {
      await client.remove(indexName, id);
    },

    async deleteWhere(indexName, filters: FilterCondition[]) {
      // Note: Most backends support deleteWhere natively.
      // If not, fetch matching docs and delete individually.
      throw new Error("deleteWhere not implemented - fetch and delete individually");
    },

    async stats(indexName) {
      const count = await client.count(indexName);
      return { count };
    },
  };
}

// ---------------------------------------------------------------------------
// Example helper functions (optional, for reference)
// ---------------------------------------------------------------------------

/**
 * Example: Convert SearchQuery to your backend's filter format.
 */
function buildFilter(
  filters?: FilterCondition[] | Record<string, unknown>,
): string | undefined {
  if (!filters) return undefined;
  if (!Array.isArray(filters)) {
    return Object.entries(filters)
      .map(([k, v]) => `${k}:"${v}"`)
      .join(" AND ");
  }
  return filters
    .map((f) => {
      const { field, operator = "=", value } = f;
      switch (operator) {
        case "=":
          return `${field}:"${value}"`;
        case "!=":
          return `NOT ${field}:"${value}"`;
        case "<":
          return `${field} < ${value}`;
        case "<=":
          return `${field} <= ${value}`;
        case ">":
          return `${field} > ${value}`;
        case ">=":
          return `${field} >= ${value}`;
        case "IN": {
          const arr = Array.isArray(value) ? value : [value];
          return `${field}:(${arr.map((v) => `"${v}"`).join(" OR ")})`;
        }
        case "NOT IN": {
          const arr = Array.isArray(value) ? value : [value];
          return `NOT ${field}:(${arr.map((v) => `"${v}"`).join(" OR ")})`;
        }
        default:
          return `${field}:"${value}"`;
      }
    })
    .join(" AND ");
}

/**
 * Example: Transform search results to SearchResult format.
 */
function mapResults(
  hits: SearchDocument[],
  total: number,
  page: number,
  pageSize: number,
  facets?: FacetRequest[],
): SearchResult {
  const facetResults = facets
    ? (facets as Array<string | FacetRequest>).map((f) => ({
        field: typeof f === "string" ? f : f.field,
        values: [] as FacetValue[],
      }))
    : undefined;

  return {
    items: hits,
    total,
    page,
    pageSize,
    facets: facetResults,
  };
}

export default starterAdapter;