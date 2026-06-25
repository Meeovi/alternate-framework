import type {
  AdapterIndexOptions,
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
  createTypesenseClient,
  type TypesenseClient,
  type TypesenseField,
  type TypesenseFieldType,
} from "./client";

export type TypesenseAdapterConfig = {
  host: string;
  apiKey: string;
  /** Inject a pre-built client (useful in tests). */
  client?: TypesenseClient;
  /** Default searchable fields when no fieldMap is provided. */
  defaultQueryBy?: string;
};

/**
 * Typesense search adapter.
 *
 * Features:
 * - Collection schema derived from IndexSchema fieldMap with proper Typesense types
 * - filter_by expressions for all FilterCondition operators
 * - Multi-field sort_by
 * - Facet counts and numeric stats (sum/avg/min/max)
 * - Hit highlighting with custom tags
 * - Vector query via `vector_query` param
 * - JSONL bulk import with upsert action
 * - deleteWhere via filter_by DELETE
 * - Collection stats
 */
export function typesenseAdapter(config: TypesenseAdapterConfig): SearchAdapter {
  const client = config.client ?? createTypesenseClient(config.host, config.apiKey);

  function mapFieldType(def: FieldDefinition): TypesenseFieldType {
    switch (def.type) {
      case "number":   return def.sortable ? "float" : "float";
      case "boolean":  return "bool";
      case "string[]": return "string[]";
      case "number[]": return "float[]";
      case "vector":   return "float[]";
      default:         return "string";
    }
  }

  function buildCollectionFields(indexName: string, schema: IndexSchema): TypesenseField[] {
    const fieldMap = schema.fieldMap ?? {};
    const fields: TypesenseField[] = [];

    for (const fname of schema.fields ?? []) {
      if (!fieldMap[fname]) {
        fields.push({ name: fname, type: "string", facet: false, optional: true });
      }
    }

    for (const [fname, def] of Object.entries(fieldMap)) {
      const field: TypesenseField = {
        name: fname,
        type: def.type === "vector" ? "float[]" : mapFieldType(def),
        facet: def.facetable ?? false,
        optional: def.optional ?? false,
        index: def.searchable !== false,
        sort: def.sortable ?? false,
      };
      if (def.type === "vector" && def.dimensions) {
        field.num_dim = def.dimensions;
      }
      fields.push(field);
    }

    // Ensure id is always present
    if (!fields.find((f) => f.name === (schema.primaryKey ?? "id"))) {
      fields.unshift({ name: schema.primaryKey ?? "id", type: "string" });
    }

    return fields;
  }

  function buildQueryBy(schema: IndexSchema): string {
    const searchable = Object.entries(schema.fieldMap ?? {})
      .filter(([, d]) => d.searchable !== false && d.type !== "vector")
      .map(([f]) => f);

    if (searchable.length > 0) return searchable.join(",");
    if (schema.fields && schema.fields.length > 0) return schema.fields.join(",");
    return config.defaultQueryBy ?? "*";
  }

  function buildFilterBy(filters?: FilterCondition[] | Record<string, unknown>): string | undefined {
    if (!filters) return undefined;
    const conditions = Array.isArray(filters)
      ? filters.map(conditionToTypesense)
      : Object.entries(filters).map(([k, v]) => `${k}:=${JSON.stringify(v)}`);
    return conditions.length > 0 ? conditions.join(" && ") : undefined;
  }

  function conditionToTypesense(c: FilterCondition): string {
    const { field: f, operator: op = "=", value: v } = c;
    switch (op) {
      case "=":      return `${f}:=${stringify(v)}`;
      case "!=":     return `${f}:!=${stringify(v)}`;
      case "<":      return `${f}:<${stringify(v)}`;
      case "<=":     return `${f}:<=${stringify(v)}`;
      case ">":      return `${f}:>${stringify(v)}`;
      case ">=":     return `${f}:>=${stringify(v)}`;
      case "IN":     return Array.isArray(v) ? `${f}:[${v.map(stringify).join(",")}]` : `${f}:=${stringify(v)}`;
      case "NOT IN": return Array.isArray(v) ? `${f}:!=[${v.map(stringify).join(",")}]` : `${f}:!=${stringify(v)}`;
      default:       return `${f}:=${stringify(v)}`;
    }
  }

  function stringify(v: unknown): string {
    if (typeof v === "string") return v;
    return String(v);
  }

  function buildSortBy(sort?: SearchQuery["sort"]): string | undefined {
    if (!sort) return undefined;
    const arr = Array.isArray(sort) ? sort : [sort];
    return arr.map((s) => `${s.field}:${s.order ?? "asc"}`).join(",");
  }

  function buildFacetBy(facets?: SearchQuery["facets"]): string | undefined {
    if (!facets || facets.length === 0) return undefined;
    return (facets as Array<string | { field: string }>)
      .map((f) => (typeof f === "string" ? f : f.field))
      .join(",");
  }

  function mapFacets(raw?: TypesenseSearchResponse["facet_counts"]): FacetResult[] {
    if (!raw) return [];
    return raw.map((fc) => {
      const values: FacetValue[] = (fc.counts ?? []).map(({ value, count }) => ({
        value: value as string | number | boolean,
        count,
      }));
      return {
        field: fc.field_name,
        values,
        stats: fc.stats
          ? {
              min: fc.stats.min ?? 0,
              max: fc.stats.max ?? 0,
              avg: fc.stats.avg ?? 0,
              sum: fc.stats.sum ?? 0,
            }
          : undefined,
      };
    });
  }

  // Store per-index query_by for use at query time
  const queryByMap = new Map<string, string>();

  return {
    async setup(indexes: Record<string, IndexSchema>) {
      for (const [name, schema] of Object.entries(indexes)) {
        queryByMap.set(name, buildQueryBy(schema));
        await client
          .createCollection({
            name,
            fields: buildCollectionFields(name, schema),
            default_sorting_field: schema.fields?.[0],
            enable_nested_fields: true,
          })
          .catch(() => undefined); // Already exists
      }
    },

    async index(indexName, docs, options?: AdapterIndexOptions) {
      const action = options?.upsert !== false ? "upsert" : "create";
      await client.importDocuments(indexName, docs, { action });
    },

    async query(indexName, query: SearchQuery): Promise<SearchResult> {
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? query.limit ?? 20;
      const queryBy = queryByMap.get(indexName) ?? config.defaultQueryBy ?? "*";

      let vectorQuery: string | undefined;
      if (query.vector && queryBy !== "*") {
        // Typesense vector query format: "vec:([0.12, ...], k:10)"
        vectorQuery = `${queryBy.split(",")[0]}:([${query.vector.join(",")}], k:${pageSize})`;
      }

      const resp = await client.search(indexName, {
        query_by:            vectorQuery ? "*" : queryBy,
        filter_by:           buildFilterBy(query.filters),
        sort_by:             buildSortBy(query.sort),
        facet_by:            buildFacetBy(query.facets),
        max_facet_values:    50,
        page,
        per_page:            pageSize,
        highlight_fields:    query.highlight?.fields.join(","),
        highlight_start_tag: query.highlight?.preTag,
        highlight_end_tag:   query.highlight?.postTag,
        vector_query:        vectorQuery,
        prefix:              true,
        num_typos:           1,
      });

      const items = (resp.hits ?? []).map((h) => h.document);
      const highlights = query.highlight?.fields.length
        ? (resp.hits ?? []).map((h) => {
            const out: Record<string, string[]> = {};
            for (const hl of h.highlights ?? []) {
              out[hl.field] = hl.snippets ?? [hl.snippet];
            }
            return out;
          })
        : undefined;

      return {
        items: items as SearchResult["items"],
        total: resp.found ?? 0,
        page,
        pageSize,
        facets: mapFacets(resp.facet_counts),
        highlights,
        took: resp.search_time_ms,
      };
    },

    async delete(indexName, id) {
      await client.deleteDocument(indexName, id);
    },

    async deleteWhere(indexName, filters) {
      const filterBy = buildFilterBy(filters);
      if (!filterBy) return 0;
      const result = await client.deleteByFilter(indexName, filterBy);
      return result.num_deleted ?? 0;
    },

    async stats(indexName) {
      const col = await client.getCollection(indexName);
      return { count: col?.num_documents ?? 0 };
    },
  };
}

// Local alias to avoid import cycle
type TypesenseSearchResponse = import("./client").TypesenseSearchResponse;
