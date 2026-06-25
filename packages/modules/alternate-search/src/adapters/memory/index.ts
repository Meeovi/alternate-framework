import type { SearchAdapter, SearchDocument, SearchQuery, SearchResult } from "../../core/types";
import type { AdapterIndexOptions, FacetResult, FacetValue, FilterCondition } from "../../core/types";
import { cosineSimilarity } from "../../core/vectorizer";

type MemoryStore = Map<string, Map<string, SearchDocument>>;

// ---------------------------------------------------------------------------
// Filter evaluation
// ---------------------------------------------------------------------------

function evaluateCondition(doc: SearchDocument, cond: FilterCondition): boolean {
  const docVal = doc[cond.field];
  const op = cond.operator ?? "=";
  const val = cond.value;
  switch (op) {
    case "=":   return docVal === val;
    case "!=":  return docVal !== val;
    case ">":   return Number(docVal) > Number(val);
    case ">=":  return Number(docVal) >= Number(val);
    case "<":   return Number(docVal) < Number(val);
    case "<=":  return Number(docVal) <= Number(val);
    case "IN":  return Array.isArray(val) && val.includes(docVal);
    case "NOT IN": return Array.isArray(val) && !val.includes(docVal);
    default:    return false;
  }
}

function matchesFilters(
  doc: SearchDocument,
  filters?: FilterCondition[] | Record<string, unknown>,
): boolean {
  if (!filters) return true;
  if (Array.isArray(filters)) {
    return filters.every((c) => evaluateCondition(doc, c));
  }
  // Plain key=value map
  return Object.entries(filters).every(([k, v]) => doc[k] === v);
}

// ---------------------------------------------------------------------------
// BM25 text scoring (in-memory)
// ---------------------------------------------------------------------------

function extractText(doc: SearchDocument): string {
  return Object.values(doc)
    .filter((v): v is string => typeof v === "string")
    .join(" ");
}

const BM25_K1 = 1.5;
const BM25_B  = 0.75;
const BM25_AVG_LEN = 15;

function bm25(docText: string, tokens: string[]): number {
  const words = docText.toLowerCase().split(/\s+/);
  const len = words.length || 1;
  let score = 0;
  for (const token of tokens) {
    const tf = words.filter((w) => w.includes(token)).length;
    if (tf === 0) continue;
    const idf = Math.log((1000 - tf + 0.5) / (tf + 0.5) + 1);
    const tfn = (tf * (BM25_K1 + 1)) / (tf + BM25_K1 * (1 - BM25_B + BM25_B * len / BM25_AVG_LEN));
    score += idf * tfn;
  }
  return score;
}

// ---------------------------------------------------------------------------
// Facet computation
// ---------------------------------------------------------------------------

type FacetReq = { field: string; limit?: number; stats?: boolean };

function computeFacets(docs: SearchDocument[], requests: FacetReq[]): FacetResult[] {
  return requests.map(({ field, limit = 10, stats: wantStats }) => {
    const counts = new Map<unknown, number>();
    const nums: number[] = [];
    for (const doc of docs) {
      const v = doc[field];
      if (v === undefined || v === null) continue;
      counts.set(v, (counts.get(v) ?? 0) + 1);
      if (typeof v === "number") nums.push(v);
    }
    const values: FacetValue[] = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([value, count]) => ({ value: value as string | number | boolean, count }));

    let statsResult: FacetResult["stats"];
    if (wantStats && nums.length > 0) {
      const sum = nums.reduce((a, n) => a + n, 0);
      statsResult = {
        min: Math.min(...nums),
        max: Math.max(...nums),
        avg: sum / nums.length,
        sum,
      };
    }
    return { field, values, stats: statsResult };
  });
}

// ---------------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------------

type SortCrit = { field: string; order?: "asc" | "desc" };

function sortDocs(docs: SearchDocument[], sort: SortCrit | SortCrit[]): SearchDocument[] {
  const criteria = Array.isArray(sort) ? sort : [sort];
  return [...docs].sort((a, b) => {
    for (const { field, order = "asc" } of criteria) {
      const av = a[field], bv = b[field];
      if (av === bv) continue;
      const dir = order === "asc" ? 1 : -1;
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      return av < bv ? -dir : dir;
    }
    return 0;
  });
}

// ---------------------------------------------------------------------------
// Memory adapter factory
// ---------------------------------------------------------------------------

/**
 * Zero-dependency in-memory search adapter.
 *
 * Features: BM25 scoring, structured filter conditions (=, !=, <, <=, >, >=,
 * IN, NOT IN), facet aggregation with optional numeric stats, multi-field
 * sort, vector cosine search, deleteWhere, and stats.
 *
 * Ideal for unit tests, development environments, and small corpora.
 */
export function memoryAdapter(): SearchAdapter {
  const store: MemoryStore = new Map();

  function bucket(indexName: string): Map<string, SearchDocument> {
    if (!store.has(indexName)) store.set(indexName, new Map());
    return store.get(indexName)!;
  }

  return {
    async setup(indexes) {
      for (const name of Object.keys(indexes)) bucket(name);
    },

    async index(indexName, docs, options?: AdapterIndexOptions) {
      const b = bucket(indexName);
      for (const doc of docs) {
        if (options?.upsert) {
          const existing = b.get(doc.id);
          b.set(doc.id, existing ? { ...existing, ...doc } : doc);
        } else {
          b.set(doc.id, doc);
        }
      }
    },

    async query(indexName, query: SearchQuery): Promise<SearchResult> {
      const b = bucket(indexName);
      const page     = query.page ?? 1;
      const pageSize = query.pageSize ?? query.limit ?? 20;
      const q        = String(query.q ?? query.term ?? "");
      const tokens   = q.length > 0 ? q.toLowerCase().split(/\s+/).filter(Boolean) : [];

      // 1. Filter
      let docs = Array.from(b.values()).filter((doc) =>
        matchesFilters(doc, query.filters),
      );

      // 2. Text search
      if (tokens.length > 0) {
        // Score each document; keep only those with score > 0
        const scored = docs
          .map((doc) => ({ doc, score: bm25(extractText(doc), tokens) }))
          .filter((s) => s.score > 0);
        scored.sort((a, b) => b.score - a.score);
        docs = scored.map((s) => s.doc);
      } else if (query.vector && query.vector.length > 0) {
        // Vector-only search
        const scored = docs
          .map((doc) => {
            const dv = Array.isArray(doc["_vector"]) ? (doc["_vector"] as number[]) : [];
            return { doc, score: dv.length > 0 ? cosineSimilarity(query.vector!, dv) : 0 };
          })
          .filter((s) => s.score > 0);
        scored.sort((a, b) => b.score - a.score);
        docs = scored.map((s) => s.doc);
      }

      // 3. Facets (computed on the filtered-but-not-paged set)
      let facets: FacetResult[] | undefined;
      if (query.facets && query.facets.length > 0) {
        const reqs: FacetReq[] = (query.facets as Array<string | FacetReq>).map((f) =>
          typeof f === "string" ? { field: f } : f,
        );
        facets = computeFacets(docs, reqs);
      }

      // 4. Sort (when no text/vector relevance drives order)
      if (query.sort && tokens.length === 0 && !query.vector) {
        docs = sortDocs(docs, query.sort);
      }

      // 5. Geo filter (haversine)
      if (query.geo) {
        const { center, radiusKm, field = "_geo" } = query.geo;
        docs = docs.filter((doc) => {
          const gv = doc[field] as { lat?: number; lng?: number } | undefined;
          if (!gv?.lat || !gv?.lng) return false;
          return haversineKm(center.lat, center.lng, gv.lat, gv.lng) <= radiusKm;
        });
      }

      const total = docs.length;
      const start = (page - 1) * pageSize;
      return { items: docs.slice(start, start + pageSize), total, page, pageSize, facets };
    },

    async delete(indexName, id) {
      store.get(indexName)?.delete(id);
    },

    async deleteWhere(indexName, filters: FilterCondition[]): Promise<number> {
      const b = store.get(indexName);
      if (!b) return 0;
      let count = 0;
      for (const [id, doc] of b) {
        if (filters.every((c) => evaluateCondition(doc, c))) {
          b.delete(id);
          count++;
        }
      }
      return count;
    },

    async stats(indexName) {
      return { count: store.get(indexName)?.size ?? 0 };
    },
  };
}

// ---------------------------------------------------------------------------
// Haversine distance (km)
// ---------------------------------------------------------------------------

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Note: memoryAdapter is a factory function that returns a SearchAdapter.
// The registry in src/manager/adapter/registry.ts expects MeeoviSearchAdapter instances.
// Do not self-register here; consumers should use the adapter directly or through multiBackendAdapter.