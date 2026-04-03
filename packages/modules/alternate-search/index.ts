// ---------------------------------------------------------------------------
// alternate-search — main barrel
// ---------------------------------------------------------------------------

// Core factory
export { createSearch } from "./core/search";

// Core types
export type {
  // schema
  FieldType,
  FieldDefinition,
  IndexSchema,
  InferSearchDocument,
  SearchDocument,
  // query
  SortCriteria,
  FilterOperator,
  FilterCondition,
  FacetRequest,
  FacetResult,
  FacetValue,
  HighlightOptions,
  HighlightResult,
  GeoPoint,
  GeoFilter,
  SearchQuery,
  SearchResult,
  SearchFederatedItem,
  SearchFederatedResult,
  SearchFederatedOptions,
  SearchRequest,
  SearchMultiResult,
  SearchMultiStreamChunk,
  // pipeline
  PipelineContext,
  IndexContext,
  SearchExecutionMeta,
  SearchMiddleware,
  SearchMiddlewareContext,
  SearchQueryLifecycleContext,
  SearchResultLifecycleContext,
  SearchErrorLifecycleContext,
  SearchLifecycleHook,
  SearchLifecycleHooks,
  SearchAnalyticsEventName,
  SearchAnalyticsBaseEvent,
  SearchPerformedAnalyticsEvent,
  SearchClickAnalyticsEvent,
  SearchConversionAnalyticsEvent,
  SearchErrorAnalyticsEvent,
  SearchAnalyticsEvent,
  SearchAnalyticsProvider,
  // plugin & adapter
  SearchPlugin,
  SearchAdapter,
  AdapterIndexOptions,
  SearchPluginRegistry,
  // config & instance
  SearchLogger,
  SearchConfig,
  SearchInstance,
} from "./core/types";

// Error hierarchy
export {
  SEARCH_ERROR_CODES,
  SearchError,
  SearchConfigError,
  SearchAdapterError,
  SearchQueryError,
  SearchTimeoutError,
  SearchForbiddenError,
  SearchPluginError,
  wrapAdapterError,
  wrapPluginError,
} from "./core/errors";
export type { SearchErrorCode } from "./core/errors";

// Internal utilities (exposed for advanced users)
export { tokenize } from "./core/tokenizer";
export type { TokenizeOptions } from "./core/tokenizer";
export { vectorize, cosineSimilarity } from "./core/vectorizer";
export type { VectorizeOptions } from "./core/vectorizer";

// Adapters
export { memoryAdapter } from "./adapters/memory/index";
export { meilisearchAdapter } from "./adapters/meilisearch/index";
export type { MeilisearchAdapterConfig } from "./adapters/meilisearch/index";
export { typesenseAdapter } from "./adapters/typesense/index";
export type { TypesenseAdapterConfig } from "./adapters/typesense/index";
export { elasticsearchAdapter } from "./adapters/elasticsearch/index";
export type { ElasticsearchAdapterConfig } from "./adapters/elasticsearch/index";
export type {
  OpenSearchAggregations,
  OpenSearchHit,
  OpenSearchHits,
  OpenSearchResponse,
} from "./adapters/elasticsearch/types";
export { pgvectorAdapter } from "./adapters/pgvector/index";
export type { PgvectorAdapterConfig } from "./adapters/pgvector/index";
export { sqliteAdapter } from "./adapters/sqlite/index";
export type { SqliteAdapterConfig } from "./adapters/sqlite/index";

// Plugins
export { multiBackendAdapter } from "./adapters/multi-backend/index";
export type {
  BackendConfig,
  MultiBackendAdapterConfig,
} from "./adapters/multi-backend/index";
export { multiBackendProxyAdapter } from "./adapters/proxy/index";
export type {
  ProxyBackendPreset,
  MultiBackendProxyConfig,
} from "./adapters/proxy/index";

// Plugins
export {
  semanticSearch, SEMANTIC_ERROR_CODES,
  createEmbedder, createReranker,
  autocomplete, PrefixTrie, AUTOCOMPLETE_ERROR_CODES,
  synonyms, SYNONYMS_ERROR_CODES,
  spellcheck, SPELLCHECK_ERROR_CODES,
  permissions, PERMISSIONS_ERROR_CODES,
  multitenancy, MULTITENANCY_ERROR_CODES,
  security, SECURITY_ERROR_CODES,
  createJoseJwtVerifier,
  fieldMasking,
  purgeCacheStorage,
} from "./plugins/index";
export type {
  SemanticSearchOptions,
  EmbedderConfig, EmbedderProvider, Embedder,
  RerankerConfig, RerankerProvider, Reranker,
  AutocompleteOptions,
  SynonymsOptions, SynonymEntry,
  SpellcheckOptions,
  PermissionsOptions, Permission,
  MultitenancyOptions, TenantConfig, TenantIsolationStrategy,
  SecurityOptions, RateLimitEntry, JwtOptions, JwtVerifier, JwtClaims,
  FieldMaskingOptions,
  CachePurgeScope, CachePurgeRequest, CachePurgeResult, CachePurgeOptions,
} from "./plugins/index";

// Schema helpers
export { defineIndex, mergeSchema, projectSchema } from "./schema/indexes";
export { indexSchemaToJsonSchema, searchIndexesToJsonSchema } from "./schema/json-schema";
export type { JsonSchema } from "./schema/json-schema";
export {
  textField, keywordField, numberField, booleanField,
  dateField, tagsField, geoField, vectorField, facetField,
} from "./schema/fields";

// HTTP client
export { createHttpClient } from "./client/http-client";
export type {
  SearchClientConfig,
  SearchClientResponse,
  BatchSearchRequest,
  BatchSearchResponse,
} from "./client/types";
export type { SearchHttpClient } from "./client/http-client";

// Analytics bridge
export {
  createAnalyticsBridge,
  createPostHogAnalyticsProvider,
  createSegmentAnalyticsProvider,
  createFileAnalyticsProvider,
  createCsvAnalyticsProvider,
  createOpenTelemetryAnalyticsProvider,
} from "./analytics/index";
export type {
  SearchAnalyticsBridge,
  SearchAnalyticsFetch,
  SearchAnalyticsWriter,
  PostHogAnalyticsProviderOptions,
  SegmentAnalyticsProviderOptions,
  FileAnalyticsProviderOptions,
  CsvAnalyticsProviderOptions,
  OpenTelemetrySpan,
  OpenTelemetryTracer,
  OpenTelemetryCounter,
  OpenTelemetryHistogram,
  OpenTelemetryMeter,
  OpenTelemetryAnalyticsProviderOptions,
} from "./analytics/index";

// Manager/composable utilities
export * from "./manager/index";

// Utils
export { createLogger, type Logger, type LogLevel, type LogHandler, type LoggerOptions } from "./utils/logger";
export { deepMerge } from "./utils/deep-merge";
export { resolveConfig, validateConfig } from "./utils/config";
export { warmSearchCache } from "./utils/cache-warming";
export type { CacheWarmRequest, CacheWarmOptions, CacheWarmResult } from "./utils/cache-warming";
