// ---------------------------------------------------------------------------
// alternate-search — main barrel
// ---------------------------------------------------------------------------

// Core factory
export { createSearch } from "./src/core/search";

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
} from "./src/core/types";

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
} from "./src/core/errors";
export type { SearchErrorCode } from "./src/core/errors";

// Internal utilities (exposed for advanced users)
export { tokenize } from "./src/core/tokenizer";
export type { TokenizeOptions } from "./src/core/tokenizer";
export { vectorize, cosineSimilarity } from "./src/core/vectorizer";
export type { VectorizeOptions } from "./src/core/vectorizer";

// Adapters
export { memoryAdapter } from "./src/adapters/memory/index";
export { meilisearchAdapter } from "./src/adapters/meilisearch/index";
export type { MeilisearchAdapterConfig } from "./src/adapters/meilisearch/index";
export { typesenseAdapter } from "./src/adapters/typesense/index";
export type { TypesenseAdapterConfig } from "./src/adapters/typesense/index";
export { elasticsearchAdapter } from "./src/adapters/elasticsearch/index";
export type { ElasticsearchAdapterConfig } from "./src/adapters/elasticsearch/index";
export type {
  OpenSearchAggregations,
  OpenSearchHit,
  OpenSearchHits,
  OpenSearchResponse,
} from "./src/adapters/elasticsearch/types";
export { pgvectorAdapter } from "./src/adapters/pgvector/index";
export type { PgvectorAdapterConfig } from "./src/adapters/pgvector/index";
export { sqliteAdapter } from "./src/adapters/sqlite/index";
export type { SqliteAdapterConfig } from "./src/adapters/sqlite/index";
export { algoliaAdapter } from "./src/adapters/algolia/index";
export type { AlgoliaAdapterConfig } from "./src/adapters/algolia/index";
export { docsearchAdapter } from "./src/adapters/docsearch/index";
export type { DocSearchAdapterConfig } from "./src/adapters/docsearch/index";
export { starterAdapter } from "./src/adapters/starter-adapter/index";
export type { StarterAdapterConfig, StarterAdapterClient } from "./src/adapters/starter-adapter/index";

// Plugins
export { multiBackendAdapter } from "./src/adapters/multi-backend/index";
export type {
  BackendConfig,
  MultiBackendAdapterConfig,
} from "./src/adapters/multi-backend/index";
export { multiBackendProxyAdapter } from "./src/adapters/proxy/index";
export type {
  ProxyBackendPreset,
  MultiBackendProxyConfig,
} from "./src/adapters/proxy/index";

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
} from "./src/plugins/index";
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
} from "./src/plugins/index";

// Schema helpers
export { defineIndex, mergeSchema, projectSchema } from "./src/schema/indexes";
export { indexSchemaToJsonSchema, searchIndexesToJsonSchema } from "./src/schema/json-schema";
export type { JsonSchema } from "./src/schema/json-schema";
export {
  textField, keywordField, numberField, booleanField,
  dateField, tagsField, geoField, vectorField, facetField,
} from "./src/schema/fields";

// HTTP client
export { createHttpClient } from "./src/client/http-client";
export type {
  SearchClientConfig,
  SearchClientResponse,
  BatchSearchRequest,
  BatchSearchResponse,
} from "./src/client/types";
export type { SearchHttpClient } from "./src/client/http-client";

// Analytics bridge
export {
  createAnalyticsBridge,
  createPostHogAnalyticsProvider,
  createSegmentAnalyticsProvider,
  createFileAnalyticsProvider,
  createCsvAnalyticsProvider,
  createOpenTelemetryAnalyticsProvider,
} from "./src/analytics/index";
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
} from "./src/analytics/index";

// Manager/composable utilities
export * from "./src/manager/index";

// Utils
export { createLogger, type Logger, type LogLevel, type LogHandler, type LoggerOptions } from "./src/runtime/utils/logger";
export { deepMerge } from "./src/runtime/utils/deep-merge";
export { resolveConfig, validateConfig } from "./src/runtime/utils/config";
export { warmSearchCache } from "./src/runtime/utils/cache-warming";
export type { CacheWarmRequest, CacheWarmOptions, CacheWarmResult } from "./src/runtime/utils/cache-warming";
