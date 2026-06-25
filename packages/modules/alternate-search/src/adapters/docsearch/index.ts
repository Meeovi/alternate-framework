import type {
  AdapterIndexOptions,
  FacetRequest,
  FacetResult,
  FacetValue,
  FilterCondition,
  IndexSchema,
  SearchAdapter,
  SearchQuery,
  SearchResult,
} from "../../core/types";

// ---------------------------------------------------------------------------
// Client interface
// ---------------------------------------------------------------------------

export type DocSearchClient = {
  search(
    query: string,
    requestOptions?: Record<string, unknown>,
  ): Promise<DocSearchResponse>;
};

type DocSearchResponse = {
  hits: DocSearchHit[];
  nbHits: number;
  page: number;
  nbPages: number;
  processingTimeMS?: number;
  facets?: Record<string, Record<string, number>>;
};

type DocSearchHit = {
  objectID: string;
  url?: string;
  anchor?: string;
  content?: string;
  hierarchy?: Record<string, string>;
  _highlightResult?: Record<string, { value?: string; matchLevel?: string }>;
  [key: string]: unknown;
};

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export type DocSearchAdapterConfig = {
  /** DocSearch application ID. */
  appId?: string;
  /** DocSearch API key (often not needed for public indices). */
  apiKey?: string;
  /**
   * List of index names to query (the API key may restrict access).
   * If multiple indices are provided, results are merged.
   */
  indices: string[];
  /** Custom fetch function (useful for testing or custom endpoints). */
  client?: DocSearchClient;
};

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

/**
 * DocSearch adapter for Algolia-hosted documentation search.
 *
 * Features:
 * - Queries multiple documentation indices
 * - Extracts hierarchy and URL from hits
 * - Hit highlighting for content fields
 * - Facet extraction
 */
export function docsearchAdapter(config: DocSearchAdapterConfig): SearchAdapter {
  const client = config.client ?? createDocSearchClient(config);

  return {
    async setup() {
      // DocSearch indices are typically pre-configured
    },

    async index() {
      throw new Error("DocSearch is read-only; indexing is not supported");
    },

    async query(_indexName, query: SearchQuery): Promise<SearchResult> {
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? query.limit ?? 20;

      const allHits: DocSearchHit[] = [];
      let total = 0;
      let took = 0;

      for (const _indexName of config.indices) {
        const resp = await client.search(query.q ?? query.term ?? "", {
          page: page - 1,
          hitsPerPage: pageSize,
          ...(query.highlight?.fields.length
            ? {
                attributesToHighlight: query.highlight!.fields,
                highlightPreTag: query.highlight?.preTag ?? "<mark>",
                highlightPostTag: query.highlight?.postTag ?? "</mark>",
              }
            : {}),
        });
        allHits.push(...resp.hits);
        total = Math.max(total, resp.nbHits ?? 0);
        took = Math.max(took, resp.processingTimeMS ?? 0);
      }

      const items = allHits.map((h) => ({
        id: h.objectID,
        url: h.url,
        anchor: h.anchor,
        content: h.content,
        hierarchy: h.hierarchy,
        ...(h as Record<string, unknown>),
      }));

      const highlights = query.highlight?.fields.length
        ? allHits.map((h) => {
            const hl = h._highlightResult;
            if (!hl) return {};
            const result: Record<string, string[]> = {};
            for (const [field, val] of Object.entries(hl)) {
              if (val?.value) result[field] = [<string>val.value];
            }
            return result;
          })
        : undefined;

      const facets = mapFacets(allHits, query.facets);

      return {
        items: items as SearchResult["items"],
        total,
        page,
        pageSize,
        facets,
        highlights,
        took,
      };
    },

    async delete() {
      throw new Error("DocSearch is read-only; deletion is not supported");
    },

    async deleteWhere() {
      throw new Error("DocSearch is read-only; deleteWhere is not supported");
    },

    async stats() {
      return { count: 0 };
    },
  };
}

function mapFacets(
  hits: DocSearchHit[],
  facets?: FacetRequest[] | string[],
): FacetResult[] | undefined {
  if (!facets) return undefined;
  const result: FacetResult[] = [];
  for (const f of facets as Array<string | FacetRequest>) {
    const field = typeof f === "string" ? f : f.field;
    const counts = new Map<string, number>();
    for (const hit of hits) {
      const hierarchy = hit.hierarchy ?? {};
      const level = hierarchy[field];
      if (level) {
        counts.set(level, (counts.get(level) ?? 0) + 1);
      }
    }
    const values: FacetValue[] = Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
    result.push({ field, values });
  }
  return result;
}

function createDocSearchClient(
  config: DocSearchAdapterConfig,
): DocSearchClient {
  const indices = config.indices;
  const baseUrl = config.appId ? `https://${config.appId}-dsn.algolia.net` : "";

  async function search(
    query: string,
    requestOptions?: Record<string, unknown>,
  ): Promise<DocSearchResponse> {
    const responses = await Promise.all(
      indices.map((indexName) =>
        fetch(`${baseUrl}/1/indexes/${indexName}/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(config.apiKey
              ? { "X-Algolia-Application-Key": config.apiKey }
              : {}),
          },
          body: JSON.stringify({
            query,
            ...requestOptions,
          }),
        })
          .then((r) => r.json() as Promise<DocSearchResponse>)
          .catch(() => ({ hits: [], nbHits: 0, page: 0, nbPages: 0, processingTimeMS: 0 })),
      ),
    );

    const hits = responses.flatMap((r) => r.hits);
    return {
      hits,
      nbHits: hits.length,
      page: responses[0]?.page ?? 0,
      nbPages: Math.max(...responses.map((r) => r.nbPages ?? 0)),
      processingTimeMS: responses[0]?.processingTimeMS,
    };
  }

  return { search };
}

export default docsearchAdapter;