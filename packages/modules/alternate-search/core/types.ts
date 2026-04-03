// ---------------------------------------------------------------------------
// Field types
// ---------------------------------------------------------------------------

export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "string[]"
  | "number[]"
  | "geo"
  | "vector";

export type FieldDefinition = {
  type: FieldType;
  /** Include field in full-text search. Default true for string fields. */
  searchable?: boolean;
  /** Allow filtering on this field. */
  filterable?: boolean;
  /** Allow sorting on this field. */
  sortable?: boolean;
  /** Compute facet counts for this field. */
  facetable?: boolean;
  /** For type "vector" — number of dimensions. */
  dimensions?: number;
  /** Return raw value in response hits. Default true. */
  stored?: boolean;
  optional?: boolean;
};

// ---------------------------------------------------------------------------
// Index schema
// ---------------------------------------------------------------------------

export type IndexSchema = {
  /** Shorthand: list of searchable field names (all treated as string). */
  fields?: string[];
  /** Explicit per-field definitions (superset of shorthand). */
  fieldMap?: Record<string, FieldDefinition>;
  /** Whether to vectorise the searchable text into a _vector field. */
  vectorize?: boolean;
  /** Document id field name. Default "id". */
  primaryKey?: string;
  /** Backend ranking rules when supported (e.g. Meilisearch). */
  rankingRules?: string[];
  /** Hard cap on results per query. Default 1000. */
  maxResults?: number;
};

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export type SearchDocument = {
  id: string;
  [key: string]: unknown;
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export type SortOrder = "asc" | "desc";

export type SortCriteria = {
  field: string;
  order?: SortOrder;
};

export type FilterOperator = "=" | "!=" | "<" | "<=" | ">" | ">=" | "IN" | "NOT IN";

export type FilterCondition = {
  field: string;
  operator?: FilterOperator;
  value: unknown;
};

export type FacetRequest = {
  field: string;
  limit?: number;
  /** Return min/max/avg/sum for numeric fields. */
  stats?: boolean;
};

export type HighlightOptions = {
  fields: string[];
  preTag?: string;
  postTag?: string;
  maxLength?: number;
};

export type GeoPoint = { lat: number; lng: number };

export type GeoFilter = {
  center: GeoPoint;
  radiusKm: number;
  /** Document field holding the geo coordinate. */
  field?: string;
};

export type SearchQuery = {
  /** Full-text search query string. */
  q?: string;
  /** Alias for q. */
  term?: string;
  /** Structured filter conditions OR a simple key-value equality map. */
  filters?: FilterCondition[] | Record<string, unknown>;
  page?: number;
  pageSize?: number;
  /** Alias for pageSize. */
  limit?: number;
  sort?: SortCriteria | SortCriteria[];
  facets?: FacetRequest[] | string[];
  highlight?: HighlightOptions;
  geo?: GeoFilter;
  /** Pre-computed query vector — bypasses the vectorizer stage. */
  vector?: number[];
  /** Opaque cursor from a previous response for cursor-based pagination. */
  cursor?: string;
  /** Tenant ID injected by the multitenancy plugin. */
  tenantId?: string;
  /** Authenticated user ID available to permission plugins. */
  userId?: string;
  /** BCP-47 locale for language-aware tokenisation. */
  locale?: string;
  /** Arbitrary backend-specific pass-through settings. */
  _options?: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

export type FacetValue = {
  value: string | number | boolean;
  count: number;
};

export type FacetResult = {
  field: string;
  values: FacetValue[];
  stats?: { min: number; max: number; avg: number; sum: number };
};

export type HighlightResult = Record<string, string[]>;

export type SearchResult<T = SearchDocument> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  facets?: FacetResult[];
  highlights?: HighlightResult[];
  /** Opaque cursor for the next page. Undefined when on the last page. */
  nextCursor?: string;
  /** Time taken by the backend in milliseconds. */
  took?: number;
};

export type SearchFederatedItem<T = SearchDocument> = {
  indexName: string;
  item: T;
  score: number;
  rank: number;
};

export type SearchFederatedResult<T = SearchDocument> = {
  items: SearchFederatedItem<T>[];
  total: number;
  took?: number;
};

export type SearchFederatedOptions = {
  /**
   * Reciprocal rank fusion constant. Higher values flatten rank differences.
   * Default: 60.
   */
  rrfK?: number;
  /** Maximum number of fused items to return. */
  limit?: number;
};

// ---------------------------------------------------------------------------
// Typed schema inference
// ---------------------------------------------------------------------------

type InferFieldValue<T extends FieldDefinition> =
  T["type"] extends "number" ? number :
  T["type"] extends "boolean" ? boolean :
  T["type"] extends "date" ? string | Date :
  T["type"] extends "string[]" ? string[] :
  T["type"] extends "number[]" ? number[] :
  T["type"] extends "geo" ? GeoPoint :
  T["type"] extends "vector" ? number[] :
  string;

type InferRequiredFieldMap<T extends Record<string, FieldDefinition>> = {
  [K in keyof T as T[K]["stored"] extends false
    ? never
    : T[K]["optional"] extends true
      ? never
      : K]: InferFieldValue<T[K]>;
};

type InferOptionalFieldMap<T extends Record<string, FieldDefinition>> = {
  [K in keyof T as T[K]["stored"] extends false
    ? never
    : T[K]["optional"] extends true
      ? K
      : never]?: InferFieldValue<T[K]>;
};

type InferFieldMapDocument<T extends Record<string, FieldDefinition>> =
  InferRequiredFieldMap<T> & InferOptionalFieldMap<T>;

type InferFieldsArrayDocument<T extends readonly string[]> = {
  [K in T[number]]?: string;
};

export type InferSearchDocument<TSchema extends IndexSchema> = SearchDocument & (
  TSchema["fieldMap"] extends Record<string, FieldDefinition>
    ? InferFieldMapDocument<TSchema["fieldMap"]>
    : TSchema["fields"] extends readonly string[]
      ? InferFieldsArrayDocument<TSchema["fields"]>
      : Record<string, unknown>
);

// ---------------------------------------------------------------------------
// Pipeline context
// ---------------------------------------------------------------------------

export type PipelineContext = {
  indexName: string;
  query: SearchQuery;
  options: Record<string, unknown>;
  /** Tokens produced by the tokenizer stage. */
  tokens: string[];
  /** Query embedding from the vectorizer / semantic plugin. */
  vector?: number[];
  /** Result populated after the adapter query stage. */
  result?: SearchResult;
  /** Free-form metadata bag for inter-plugin communication. */
  meta: Record<string, unknown>;
  /** AbortSignal propagated from the caller. */
  signal?: AbortSignal;
};

export type SearchExecutionMeta = {
  requestId: string;
  startedAt: number;
  durationMs?: number;
};

export type SearchMiddlewareContext = PipelineContext & SearchExecutionMeta;

export type SearchMiddleware = (
  ctx: SearchMiddlewareContext,
  next: () => Promise<void>,
) => Promise<void> | void;

export type SearchLifecycleHook<TContext> =
  | ((ctx: TContext) => Promise<void> | void)
  | Array<(ctx: TContext) => Promise<void> | void>;

export type SearchQueryLifecycleContext = SearchMiddlewareContext;

export type SearchResultLifecycleContext = SearchMiddlewareContext & {
  result: SearchResult;
};

export type SearchErrorLifecycleContext = SearchMiddlewareContext & {
  error: Error & { code?: string; status?: number };
};

export type SearchLifecycleHooks = {
  onQuery?: SearchLifecycleHook<SearchQueryLifecycleContext>;
  onResult?: SearchLifecycleHook<SearchResultLifecycleContext>;
  onError?: SearchLifecycleHook<SearchErrorLifecycleContext>;
};

export type SearchAnalyticsEventName =
  | "search_performed"
  | "search_clicked"
  | "search_converted"
  | "search_error";

export type SearchAnalyticsBaseEvent = {
  event: SearchAnalyticsEventName;
  timestamp: string;
  requestId?: string;
  indexName?: string;
  query?: string;
  userId?: string;
  tenantId?: string;
  backend?: string;
  metadata?: Record<string, unknown>;
};

export type SearchPerformedAnalyticsEvent = SearchAnalyticsBaseEvent & {
  event: "search_performed";
  total: number;
  page: number;
  pageSize: number;
  took?: number;
};

export type SearchClickAnalyticsEvent = SearchAnalyticsBaseEvent & {
  event: "search_clicked";
  documentId: string;
  position?: number;
  queryId?: string;
};

export type SearchConversionAnalyticsEvent = SearchAnalyticsBaseEvent & {
  event: "search_converted";
  documentId: string;
  conversionType?: string;
  value?: number;
  currency?: string;
  queryId?: string;
};

export type SearchErrorAnalyticsEvent = SearchAnalyticsBaseEvent & {
  event: "search_error";
  errorCode?: string;
  message: string;
  status?: number;
};

export type SearchAnalyticsEvent =
  | SearchPerformedAnalyticsEvent
  | SearchClickAnalyticsEvent
  | SearchConversionAnalyticsEvent
  | SearchErrorAnalyticsEvent;

export type SearchAnalyticsProvider = {
  track(event: SearchAnalyticsEvent): Promise<void> | void;
};

export type IndexContext = {
  indexName: string;
  docs: SearchDocument[];
  meta: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Plugin  (better-auth-style: factory → { id, hooks, $ERROR_CODES, ... })
// ---------------------------------------------------------------------------

/**
 * A search plugin follows the same structural contract as a better-auth
 * plugin:
 * - `id` is a required string literal used for deduplication and attribution.
 * - `$ERROR_CODES` is a const map of plugin-owned error codes.
 * - Lifecycle hooks are async functions that mutate the shared context.
 * - `rateLimit` declares rate-limit windows checked by the framework.
 * - `init` runs once when `search.setup()` is called.
 */
export type SearchPlugin = {
  /** Unique plugin identifier string (e.g. "semantic-search"). */
  id: string;
  /** Plugin-owned error codes exposed to callers. */
  $ERROR_CODES?: Readonly<Record<string, string>>;
  /** Called before the pipeline runs. Mutate ctx.query to rewrite queries. */
  beforeQuery?: (ctx: PipelineContext) => Promise<void> | void;
  /** Called after the adapter returns results. Mutate ctx.result to post-process. */
  afterQuery?: (ctx: PipelineContext) => Promise<void> | void;
  /** Called when a query pipeline throws, for observability / cleanup. */
  onError?: (ctx: SearchErrorLifecycleContext) => Promise<void> | void;
  /** Called before documents are sent to the adapter. */
  beforeIndex?: (ctx: IndexContext) => Promise<void> | void;
  /** Called after documents are indexed. */
  afterIndex?: (ctx: IndexContext) => Promise<void> | void;
  /** Per-plugin rate-limit rules enforced by the framework. */
  rateLimit?: Array<{
    matcher?: (query: SearchQuery) => boolean;
    window: number;
    max: number;
  }>;
  /** One-time initialisation hook — invoked during search.setup(). */
  init?: (indexes: Record<string, IndexSchema>) => Promise<void> | void;
};

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export type AdapterIndexOptions = {
  /** Merge/update existing documents rather than replace. */
  upsert?: boolean;
  /** Batch size hint for bulk operations. */
  batchSize?: number;
};

export type SearchAdapter = {
  /**
   * One-time setup — create indexes/tables/collections. Must be idempotent.
   */
  setup(indexes: Record<string, IndexSchema>): Promise<void>;
  /** Index (add/replace) documents. */
  index(indexName: string, docs: SearchDocument[], options?: AdapterIndexOptions): Promise<void>;
  /** Execute a search query and return results. */
  query(indexName: string, query: SearchQuery): Promise<SearchResult>;
  /** Delete a single document by id. */
  delete(indexName: string, id: string): Promise<void>;
  /** Optional: delete all documents matching filter conditions. */
  deleteWhere?: (indexName: string, filters: FilterCondition[]) => Promise<number>;
  /** Optional: return basic stats about an index. */
  stats?: (indexName: string) => Promise<{ count: number; size?: number }>;
};

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

export type SearchLogger = {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, cause?: unknown): void;
};

// ---------------------------------------------------------------------------
// Config & instance
// ---------------------------------------------------------------------------

export type SearchConfig = {
  adapter: SearchAdapter;
  indexes: Record<string, IndexSchema>;
  plugins?: SearchPlugin[];
  middleware?: SearchMiddleware[];
  hooks?: SearchLifecycleHooks;
  analytics?: SearchAnalyticsProvider[];
  /** Prefix physical index names by environment, e.g. "prod_" or "staging_". */
  indexPrefix?: string;
  /** Optional map from logical index names to physical names. */
  indexAliases?: Record<string, string>;
  /** Virtual views that transparently route to a physical source index with baseline filters. */
  virtualIndexes?: Record<string, {
    sourceIndex: string;
    filters?: FilterCondition[] | Record<string, unknown>;
  }>;
  logger?: SearchLogger;
  /** Max time in ms a query pipeline may take. Default 10 000 ms. */
  queryTimeoutMs?: number;
  /** Max documents per bulk index call. Default 500. */
  indexBatchSize?: number;
};

export type SearchRequest<TIndexes extends Record<string, IndexSchema>, TIndexName extends keyof TIndexes & string = keyof TIndexes & string> = {
  indexName: TIndexName;
  query: SearchQuery;
};

export type SearchMultiResult<
  TIndexes extends Record<string, IndexSchema>,
  TIndexName extends keyof TIndexes & string = keyof TIndexes & string,
> = {
  indexName: TIndexName;
  result: SearchResult<InferSearchDocument<TIndexes[TIndexName]>>;
};

export type SearchMultiStreamChunk<
  TIndexes extends Record<string, IndexSchema>,
  TIndexName extends keyof TIndexes & string = keyof TIndexes & string,
> = {
  indexName: TIndexName;
  result?: SearchResult<InferSearchDocument<TIndexes[TIndexName]>>;
  error?: Error;
};

export type SearchInstance<TIndexes extends Record<string, IndexSchema> = Record<string, IndexSchema>> = {
  /** Run adapter setup and plugin init for all configured indexes. */
  setup(): Promise<void>;
  /** Index documents into the named index. */
  index<TIndexName extends keyof TIndexes & string>(
    indexName: TIndexName,
    docs: InferSearchDocument<TIndexes[TIndexName]>[],
    options?: AdapterIndexOptions,
  ): Promise<void>;
  /** Execute the full search pipeline. */
  query<TIndexName extends keyof TIndexes & string>(
    indexName: TIndexName,
    query: SearchQuery,
    signal?: AbortSignal,
  ): Promise<SearchResult<InferSearchDocument<TIndexes[TIndexName]>>>;
  /** Execute multiple index queries concurrently. */
  queryMany<TIndexName extends keyof TIndexes & string>(
    requests: SearchRequest<TIndexes, TIndexName>[],
    signal?: AbortSignal,
  ): Promise<SearchMultiResult<TIndexes, TIndexName>[]>;
  /** Execute multiple index queries and yield each result as soon as it resolves. */
  queryManyStream<TIndexName extends keyof TIndexes & string>(
    requests: SearchRequest<TIndexes, TIndexName>[],
    signal?: AbortSignal,
  ): AsyncGenerator<SearchMultiStreamChunk<TIndexes, TIndexName>, void, void>;
  /** Execute federated multi-index search and fuse ranked results with RRF. */
  queryFederated<TIndexName extends keyof TIndexes & string>(
    requests: SearchRequest<TIndexes, TIndexName>[],
    options?: SearchFederatedOptions,
    signal?: AbortSignal,
  ): Promise<SearchFederatedResult<InferSearchDocument<TIndexes[TIndexName]>>>;
  /** Report a standardized click event to configured analytics providers. */
  trackClick(event: Omit<SearchClickAnalyticsEvent, "event" | "timestamp">): Promise<void>;
  /** Report a standardized conversion event to configured analytics providers. */
  trackConversion(event: Omit<SearchConversionAnalyticsEvent, "event" | "timestamp">): Promise<void>;
  /** Delete a document by id. */
  delete(indexName: keyof TIndexes & string, id: string): Promise<void>;
  /** Delete documents matching filter conditions (if adapter supports it). */
  deleteWhere(indexName: keyof TIndexes & string, filters: FilterCondition[]): Promise<number>;
  /** Return basic stats for an index. */
  stats(indexName: keyof TIndexes & string): Promise<{ count: number; size?: number }>;
};

// ---------------------------------------------------------------------------
// Plugin registry — augmented by plugins via declaration merging
// ---------------------------------------------------------------------------

/**
 * Plugins augment this interface via `declare module` to register themselves
 * with the type system, exactly like better-auth's BetterAuthPluginRegistry.
 *
 * @example
 * ```ts
 * declare module "alternate-search/core/types" {
 *   interface SearchPluginRegistry {
 *     "semantic-search": { creator: typeof semanticSearch };
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SearchPluginRegistry {}