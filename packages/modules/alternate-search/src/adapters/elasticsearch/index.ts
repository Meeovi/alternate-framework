import type {
  AdapterIndexOptions,
  FacetRequest,
  FacetResult,
  FacetValue,
  FieldDefinition,
  FilterCondition,
  IndexSchema,
  SearchAdapter,
  SearchQuery,
  SearchResult,
} from "../../core/types";
import {
  createElasticsearchClient,
  type ElasticsearchClient,
  type ElasticsearchMapping,
} from "./client";
export type {
  OpenSearchAggregations,
  OpenSearchHit,
  OpenSearchHits,
  OpenSearchResponse,
} from "./types";

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
export function elasticsearchAdapter(config: ElasticsearchAdapterConfig): SearchAdapter {
  const client =
    config.client ??
    createElasticsearchClient(config.baseUrl, {
      username: config.username,
      password: config.password,
      apiKey: config.apiKey,
    });

  function fieldToEsType(def: FieldDefinition): {
    type: string;
    dims?: number;
    similarity?: string;
    analyzer?: string;
  } {
    switch (def.type) {
      case "number":   return { type: "float" };
      case "boolean":  return { type: "boolean" };
      case "date":     return { type: "date" };
      case "string[]": return { type: "keyword" };
      case "number[]": return { type: "float" };
      case "geo":      return { type: "geo_point" };
      case "vector":   return { type: "dense_vector", dims: def.dimensions ?? 128, similarity: "cosine" };
      default:
        return def.searchable !== false
          ? { type: "text", analyzer: "standard" }
          : { type: "keyword" };
    }
  }

  function buildMappings(schema: IndexSchema): ElasticsearchMapping {
    const props: ElasticsearchMapping["properties"] = {
      [schema.primaryKey ?? "id"]: { type: "keyword" },
    };

    for (const fname of schema.fields ?? []) {
      props[fname] = { type: "text", analyzer: "standard" };
    }

    for (const [fname, def] of Object.entries(schema.fieldMap ?? {})) {
      const mapped = fieldToEsType(def);
      props[fname] = {
        type: mapped.type,
        ...(mapped.analyzer ? { analyzer: mapped.analyzer } : {}),
        ...(mapped.dims !== undefined ? { dims: mapped.dims } : {}),
        ...(mapped.similarity ? { similarity: mapped.similarity } : {}),
        index: def.searchable !== false,
      };
      // Add keyword sub-field for text so we can aggregate/sort
      if (mapped.type === "text" && (def.filterable || def.sortable || def.facetable)) {
        props[fname]!.fields = { keyword: { type: "keyword" } };
      }
    }

    return { properties: props };
  }

  function filtersToQuery(
    filters?: FilterCondition[] | Record<string, unknown>,
  ): Record<string, unknown>[] {
    if (!filters) return [];
    if (!Array.isArray(filters)) {
      return Object.entries(filters).map(([k, v]) => ({ term: { [`${k}.keyword`]: v } }));
    }
    return filters.map(conditionToEs);
  }

  function conditionToEs(c: FilterCondition): Record<string, unknown> {
    const { field: f, operator: op = "=", value: v } = c;
    const kw = `${f}.keyword`;
    switch (op) {
      case "=":      return { term: { [kw]: v } };
      case "!=":     return { bool: { must_not: [{ term: { [kw]: v } }] } };
      case "<":      return { range: { [f]: { lt: v } } };
      case "<=":     return { range: { [f]: { lte: v } } };
      case ">":      return { range: { [f]: { gt: v } } };
      case ">=":     return { range: { [f]: { gte: v } } };
      case "IN":     return { terms: { [kw]: Array.isArray(v) ? v : [v] } };
      case "NOT IN": return { bool: { must_not: [{ terms: { [kw]: Array.isArray(v) ? v : [v] } }] } };
      default:       return { term: { [kw]: v } };
    }
  }

  function buildAggregations(
    facets?: FacetRequest[] | string[],
  ): Record<string, unknown> | undefined {
    if (!facets || facets.length === 0) return undefined;
    const aggs: Record<string, unknown> = {};
    for (const f of facets as Array<string | FacetRequest>) {
      const field = typeof f === "string" ? f : f.field;
      const wantStats = typeof f !== "string" && f.stats;
      aggs[`facet_${field}`] = { terms: { field: `${field}.keyword`, size: 50 } };
      if (wantStats) {
        aggs[`stats_${field}`] = {
          stats: { field },
        };
      }
    }
    return aggs;
  }

  function mapFacets(
    facets?: FacetRequest[] | string[],
    aggregations?: EsAggregations,
  ): FacetResult[] {
    if (!facets || !aggregations) return [];
    return (facets as Array<string | FacetRequest>).map((f) => {
      const field = typeof f === "string" ? f : f.field;
      const buckets = aggregations[`facet_${field}`]?.buckets ?? [];
      const values: FacetValue[] = buckets.map(({ key, doc_count }) => ({
        value: key as string | number | boolean,
        count: doc_count,
      }));
      const st = aggregations[`stats_${field}`];
      return {
        field,
        values,
        stats:
          st && st.min !== undefined
            ? {
                min: st.min?.value ?? 0,
                max: st.max?.value ?? 0,
                avg: st.avg?.value ?? 0,
                sum: st.sum?.value ?? 0,
              }
            : undefined,
      };
    });
  }

  return {
    async setup(indexes: Record<string, IndexSchema>) {
      for (const [name, schema] of Object.entries(indexes)) {
        await client.createIndex(name, {
          settings: {
            number_of_shards: config.shards ?? 1,
            number_of_replicas: config.replicas ?? 0,
          },
          mappings: buildMappings(schema),
        });
      }
    },

    async index(indexName, docs, _options?: AdapterIndexOptions) {
      const ops: unknown[] = [];
      for (const doc of docs) {
        ops.push({ index: { _index: indexName, _id: String(doc.id ?? "") } });
        ops.push(doc);
      }
      if (ops.length > 0) await client.bulk(ops);
    },

    async query(indexName, query: SearchQuery): Promise<SearchResult> {
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? query.limit ?? 20;

      const filterClauses = filtersToQuery(query.filters);
      const aggs = buildAggregations(query.facets);

      const must: unknown[] = [];
      if (query.q || query.term) {
        must.push({
          multi_match: {
            query: query.q ?? query.term,
            type: "best_fields",
            fuzziness: "AUTO",
          },
        });
      }

      const esQuery: Record<string, unknown> = {
        from: (page - 1) * pageSize,
        size: pageSize,
        query: {
          bool: {
            ...(must.length > 0 ? { must } : { match_all: {} }),
            ...(filterClauses.length > 0 ? { filter: filterClauses } : {}),
          },
        },
        ...(aggs ? { aggs } : {}),
        ...(query.sort
          ? {
              sort: (Array.isArray(query.sort) ? query.sort : [query.sort]).map((s) => ({
                [s.field]: { order: s.order ?? "asc" },
              })),
            }
          : {}),
        ...(query.highlight?.fields.length
          ? {
              highlight: {
                pre_tags: [query.highlight.preTag ?? "<em>"],
                post_tags: [query.highlight.postTag ?? "</em>"],
                fields: Object.fromEntries(
                  query.highlight.fields.map((f) => [f, {}]),
                ),
              },
            }
          : {}),
      };

      // kNN vector search (ES 8+ / OpenSearch 2.4+)
      if (query.vector) {
        // Find vector field from mapping
        (esQuery as Record<string, unknown>)["knn"] = {
          field: "_vector",
          query_vector: query.vector,
          k: pageSize,
          num_candidates: pageSize * 2,
        };
        delete (esQuery as Record<string, unknown>)["query"];
      }

      const resp = await client.search(indexName, esQuery);

      const items = resp.hits.hits.map((h) => ({ id: h._id, ...h._source }));
      const highlights = query.highlight?.fields.length
        ? resp.hits.hits.map((h) => h.highlight ?? {})
        : undefined;

      return {
        items: items as SearchResult["items"],
        total:
          typeof resp.hits.total === "number"
            ? resp.hits.total
            : resp.hits.total?.value ?? 0,
        page,
        pageSize,
        facets: mapFacets(query.facets, resp.aggregations as EsAggregations),
        highlights,
        took: resp.took,
      };
    },

    async delete(indexName, id) {
      await client.delete(indexName, id);
    },

    async deleteWhere(indexName, filters) {
      const clauses = filtersToQuery(filters);
      if (clauses.length === 0) return 0;
      const result = await client.deleteByQuery(indexName, {
        bool: { filter: clauses },
      });
      return result.deleted ?? 0;
    },

    async stats(indexName) {
      const count = await client.count(indexName);
      return { count };
    },
  };
}

type EsAggregations = Record<
  string,
  {
    buckets?: Array<{ key: string | number; doc_count: number }>;
    min?: { value: number };
    max?: { value: number };
    avg?: { value: number };
    sum?: { value: number };
  }
>;

export default elasticsearchAdapter