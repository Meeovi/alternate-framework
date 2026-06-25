import type { SearchAdapter } from "../../core/types";
import { type ElasticsearchClient } from "./client";
export type { OpenSearchAggregations, OpenSearchHit, OpenSearchHits, OpenSearchResponse, } from "./types";
export type ElasticsearchAdapterConfig = {
    baseUrl: string;
    username?: string;
    password?: string;
    apiKey?: string;
    /** Inject a pre-built client (for testing). */
    client?: ElasticsearchClient;
    /** Default shards/replicas for index creation. */
    shards?: number;
    replicas?: number;
};
/**
 * Elasticsearch / OpenSearch search adapter.
 *
 * Features:
 * - Index mappings derived from IndexSchema fieldMap
 * - Bool query (must/filter) from FilterCondition[] with all operators
 * - Aggregations (terms + stats) from facet requests
 * - Hit highlighting
 * - kNN vector search via `knn` parameter (ES 8.x+)
 * - Bulk indexing via _bulk API
 * - delete_by_query
 * - _count stats
 */
export declare function elasticsearchAdapter(config: ElasticsearchAdapterConfig): SearchAdapter;
