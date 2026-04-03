// ---------------------------------------------------------------------------
// plugins/index.ts — barrel re-export for all alternate-search plugins
// ---------------------------------------------------------------------------

// ---- Semantic search (vector embedding + re-ranking) ---- //
export {
  semanticSearch,
  createEmbedder,
  SEMANTIC_ERROR_CODES,
} from "./semantic/index";
export type {
  SemanticSearchOptions,
  EmbedderConfig,
  EmbedderProvider,
  Embedder,
} from "./semantic/index";

// Re-exported from semantic/index which forwards them from ./reranker
export { createReranker } from "./semantic/index";
export type { RerankerConfig, RerankerProvider, Reranker } from "./semantic/index";

// ---- Autocomplete ---- //
export {
  autocomplete,
  PrefixTrie,
  AUTOCOMPLETE_ERROR_CODES,
} from "./autocomplete/index";
export type { AutocompleteOptions } from "./autocomplete/index";

// ---- Synonyms ---- //
export { synonyms, SYNONYMS_ERROR_CODES } from "./synonyms/index";
export type { SynonymsOptions, SynonymEntry } from "./synonyms/index";

// ---- Spellcheck ---- //
export { spellcheck, SPELLCHECK_ERROR_CODES } from "./spellcheck";
export type { SpellcheckOptions } from "./spellcheck";

// ---- Permissions ---- //
export { permissions, PERMISSIONS_ERROR_CODES } from "./permissions/index";
export type { PermissionsOptions, Permission } from "./permissions/index";

// ---- Multitenancy ---- //
export { multitenancy, MULTITENANCY_ERROR_CODES } from "./multitenancy/index";
export type {
  MultitenancyOptions,
  TenantConfig,
  TenantIsolationStrategy,
} from "./multitenancy/index";

// ---- Query suggestions (prefix-trie backed) ---- //
export { suggestions } from "./suggestions";
export type { SuggestionsOptions } from "./suggestions";

// ---- Caching ---- //
export { caching, CACHING_ERROR_CODES } from "./caching";
export {
  createMemoryCacheStorage,
  createRedisCacheStorage,
  purgeCacheStorage,
} from "./caching";
export type {
  CachingOptions,
  CacheStorage,
  CachePurgeScope,
  CachePurgeRequest,
  CachePurgeResult,
  CachePurgeOptions,
  CacheEntryState,
  CacheSetEntryOptions,
  CacheEnvelope,
  CacheSerializer,
  MemoryCacheStorageOptions,
  RedisCacheClient,
  RedisCacheStorageOptions,
} from "./caching";

// ---- Logging ---- //
export { logger } from "./logger";
export type { LoggerOptions } from "./logger";

// ---- Audits ---- //
export { audits } from "./audits";
export type { AuditsOptions, AuditRecord, AuditEventType } from "./audits";

// ---- Alerts ---- //
export { alerts } from "./alerts";
export type { AlertsOptions, AlertEvent, AlertSeverity } from "./alerts";

// ---- Statistics ---- //
export { statistics } from "./statistics";
export type { StatisticsOptions } from "./statistics";

// ---- Scoring ---- //
export { scoring } from "./scoring";
export type { ScoringOptions, FieldBoost, RecencyDecay } from "./scoring";

// ---- Full-text configuration ---- //
export { fullText } from "./full-text";
export type { FullTextOptions, FullTextFieldConfig } from "./full-text";

// ---- Text analysis / stemming ---- //
export { textAnalysis } from "./text-analysis";
export type { TextAnalysisOptions, BuiltinStemmer } from "./text-analysis";

// ---- Query string parsing ---- //
export { parsing } from "./parsing";
export type { ParsingOptions, ParseSyntax } from "./parsing";

// ---- Filter normalisation ---- //
export { filters } from "./filters";
export type { FiltersOptions, FilterRule } from "./filters";

// ---- Faceted search ---- //
export { facetedSearch } from "./faceted-search";
export type { FacetedSearchOptions, FacetConfig } from "./faceted-search";

// ---- Geospatial ---- //
export { geospatial } from "./geospatial";
export type { GeospatialOptions, DistanceUnit } from "./geospatial";

// ---- Indexing guards ---- //
export { indexing } from "./indexing";
export type { IndexingOptions, FieldRule as IndexingFieldRule, FieldType as IndexingFieldType } from "./indexing";

// ---- Schema management ---- //
export { schema } from "./schema";
export type {
  SchemaOptions,
  SchemaRecord,
  FieldDefinition as SchemaFieldDefinition,
  FieldTypeHint,
} from "./schema";

// ---- Storage hints ---- //
export { storage } from "./storage";
export type { StorageOptions, StorageEngine, StorageTier, IndexStorageConfig } from "./storage";

// ---- Security ---- //
export { security, SECURITY_ERROR_CODES } from "./security";
export { createJoseJwtVerifier } from "./security";
export type { SecurityOptions, RateLimitEntry, JwtOptions, JwtVerifier, JwtClaims } from "./security";

// ---- Field-level masking ---- //
export { fieldMasking } from "./field-masking";
export type { FieldMaskingOptions } from "./field-masking";

// ---- Proxy / Shadow traffic ---- //
export { proxy } from "./proxy";
export type { ProxyOptions, ProxyMode } from "./proxy";

// ---- Write replication ---- //
export { writeReplication } from "./write-replication";
export type { ReplicationOptions } from "./write-replication";

// ---- Recommendations ---- //
export { recommendations } from "./recommendations";
export type { RecommendationsOptions, RecommendStrategy } from "./recommendations";

// ---- Voice search ---- //
export { voiceSearch } from "./voice-search";
export type { VoiceSearchOptions, TranscribeInput } from "./voice-search";

// ---- MCP tool exposure ---- //
export { mcp } from "./mcp";
export type {
  McpOptions,
  McpHandler,
  McpToolDefinition,
  McpCallResult,
  McpExecutor,
} from "./mcp";

// ---- Query optimizations ---- //
export { optimizations } from "./opimizations";
export type { OptimizationsOptions } from "./opimizations";

// ---- Backup / restore ---- //
export { backups } from "./backups";
export type { BackupsOptions, BackupRecord } from "./backups";

// ---- Export / serialization ---- //
export { exportPlugin, exportResults } from "./export";
export type { ExportOptions, ExportFormat } from "./export";

// ---- Aggregations ---- //
export { aggregations } from "./aggregations";
export type { AggregationsOptions, AggConfig, AggResult, AggType } from "./aggregations";

// ---- Index lifecycle management ---- //
export { indices } from "./indices";
export type { IndicesOptions, IndexDefinition } from "./indices";

// ---- Cluster routing ---- //
export { clusters } from "./clusters";
export type { ClustersOptions, ClusterNode, NodeStatus } from "./clusters";

// ---- Geo-replication ---- //
export { geoReplication } from "./geo-replication";
export type { GeoReplicationOptions, RegionConfig } from "./geo-replication";

// ---- Web crawler ---- //
export { crawler } from "./cralwer";
export type { CrawlerOptions, CrawlerTransformResult } from "./cralwer";
