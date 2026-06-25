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
// Database interface — decoupled from any specific pg driver
// ---------------------------------------------------------------------------

/**
 * Minimal database interface accepted by the pgvector adapter.
 * Compatible with `pg` Pool/Client, `postgres.js`, Drizzle's execute(), etc.
 * Pass in any object with a `query(sql, params)` method.
 */
export type PgQueryResult<R = Record<string, unknown>> = {
  rows: R[];
  rowCount?: number | null;
};

export type PgDatabase = {
  query<R = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<PgQueryResult<R>>;
};

export type PgvectorAdapterConfig = {
  db: PgDatabase;
  /**
   * Vector dimensionality. Default 1536 (OpenAI text-embedding-3-small).
   * Must match the `dimensions` field on vector-typed fields.
   */
  dimensions?: number;
  /** PG schema to use. Default "public". */
  schema?: string;
};

/**
 * pgvector search adapter.
 *
 * Features:
 * - One table per index, created via IF NOT EXISTS (idempotent setup)
 * - HNSW index on vector column, GIN index on tsvector column
 * - tsvector FTS (websearch_to_tsquery) for lexical search
 * - pgvector cosine similarity for semantic search
 * - Hybrid BM25-style scoring: `ts_rank` + `1 - (vec <=> query_vec)`
 * - Filter pushdown with typed operators
 * - GROUP BY facets with COUNT + numeric stats (min/max/avg/sum)
 * - UPSERT via ON CONFLICT (id) DO UPDATE
 * - deleteWhere via parameterised DELETE … WHERE
 * - stats via SELECT COUNT(*)
 *
 * NOTE: Requires the `pgvector` Postgres extension to be installed.
 * Run `CREATE EXTENSION IF NOT EXISTS vector;` once in your database.
 */
export function pgvectorAdapter(config: PgvectorAdapterConfig): SearchAdapter {
  const { db } = config;
  const dimensions = config.dimensions ?? 1536;
  const schema = config.schema ?? "public";

  function tbl(indexName: string): string {
    return `"${schema}"."${indexName.replace(/"/g, "")}"`;
  }

  function buildColumns(indexSchema: IndexSchema): string {
    const cols: string[] = [
      `"id" TEXT PRIMARY KEY`,
      `"_data" JSONB NOT NULL DEFAULT '{}'`,
      `"_fts" TSVECTOR GENERATED ALWAYS AS (jsonb_to_tsvector('simple', _data, '"all"')) STORED`,
      `"_vector" VECTOR(${dimensions})`,
      `"_created_at" TIMESTAMPTZ NOT NULL DEFAULT now()`,
      `"_updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()`,
    ];

    // Add typed columns for sortable/filterable/facetable fields
    for (const [field, def] of Object.entries(indexSchema.fieldMap ?? {})) {
      if (field === "id") continue;
      if (def.sortable || def.filterable || def.facetable) {
        const pgType = fieldToPgType(def.type);
        cols.push(`"${field}" ${pgType} GENERATED ALWAYS AS ((_data->>'${field}')::${pgType}) STORED`);
      }
    }

    return cols.join(",\n  ");
  }

  function fieldToPgType(type: string): string {
    switch (type) {
      case "number":  return "DOUBLE PRECISION";
      case "boolean": return "BOOLEAN";
      case "date":    return "TIMESTAMPTZ";
      default:        return "TEXT";
    }
  }

  function buildWhereClause(
    filters?: FilterCondition[] | Record<string, unknown>,
    params: unknown[] = [],
  ): string {
    if (!filters) return "";
    const conditions = Array.isArray(filters)
      ? filters
      : Object.entries(filters).map(([field, value]): FilterCondition => ({
          field,
          operator: "=",
          value,
        }));

    if (conditions.length === 0) return "";

    const parts = conditions.map((c) => {
      const { field: f, operator: op = "=", value: v } = c;
      const idx = params.push(v);
      switch (op) {
        case "=":      return `"${f}" = $${idx}`;
        case "!=":     return `"${f}" != $${idx}`;
        case "<":      return `"${f}" < $${idx}`;
        case "<=":     return `"${f}" <= $${idx}`;
        case ">":      return `"${f}" > $${idx}`;
        case ">=":     return `"${f}" >= $${idx}`;
        case "IN":     {
          // Re-bind as array
          params.pop();
          const arr = Array.isArray(v) ? v : [v];
          const placeholders = arr.map((val) => {
            params.push(val);
            return `$${params.length}`;
          });
          return `"${f}" IN (${placeholders.join(", ")})`;
        }
        case "NOT IN": {
          params.pop();
          const arr = Array.isArray(v) ? v : [v];
          const placeholders = arr.map((val) => {
            params.push(val);
            return `$${params.length}`;
          });
          return `"${f}" NOT IN (${placeholders.join(", ")})`;
        }
        default:       return `"${f}" = $${idx}`;
      }
    });

    return "WHERE " + parts.join(" AND ");
  }

  return {
    async setup(indexes: Record<string, IndexSchema>) {
      // Ensure pgvector extension
      await db.query("CREATE EXTENSION IF NOT EXISTS vector").catch(() => undefined);

      for (const [name, schema] of Object.entries(indexes)) {
        const table = tbl(name);
        const cols = buildColumns(schema);

        await db.query(`
          CREATE TABLE IF NOT EXISTS ${table} (
            ${cols}
          )
        `);

        // GIN index for full-text search
        await db.query(`
          CREATE INDEX IF NOT EXISTS "${name}_fts_idx"
          ON ${table} USING GIN (_fts)
        `).catch(() => undefined);

        // HNSW index for vector search
        await db.query(`
          CREATE INDEX IF NOT EXISTS "${name}_vec_idx"
          ON ${table} USING hnsw (_vector vector_cosine_ops)
        `).catch(() => undefined);
      }
    },

    async index(indexName, docs, options?: AdapterIndexOptions) {
      if (docs.length === 0) return;
      const table = tbl(indexName);
      const upsert = options?.upsert !== false;

      for (const doc of docs) {
        const id = String(doc.id ?? "");
        const vector = doc._vector as number[] | undefined;
        const data = { ...doc };
        delete data._vector;

        if (upsert) {
          await db.query(
            `INSERT INTO ${table} ("id", "_data", "_vector")
             VALUES ($1, $2, $3)
             ON CONFLICT ("id") DO UPDATE SET
               "_data"       = EXCLUDED."_data",
               "_vector"     = EXCLUDED."_vector",
               "_updated_at" = now()`,
            [id, JSON.stringify(data), vector ? `[${vector.join(",")}]` : null],
          );
        } else {
          await db.query(
            `INSERT INTO ${table} ("id", "_data", "_vector")
             VALUES ($1, $2, $3)`,
            [id, JSON.stringify(data), vector ? `[${vector.join(",")}]` : null],
          );
        }
      }
    },

    async query(indexName, query: SearchQuery): Promise<SearchResult> {
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? query.limit ?? 20;
      const offset = (page - 1) * pageSize;
      const table = tbl(indexName);
      const params: unknown[] = [];

      // Scoring expression
      let scoreExpr: string;
      let orderClause: string;

      if (query.vector) {
        const vecParam = params.push(`[${query.vector.join(",")}]`);
        // Hybrid: FTS rank + vector similarity
        if (query.q || query.term) {
          const tsParam = params.push(query.q ?? query.term ?? "");
          scoreExpr = `(0.5 * ts_rank(_fts, websearch_to_tsquery('simple', $${tsParam})) + 0.5 * (1 - (_vector <=> $${vecParam}::vector)))`;
        } else {
          scoreExpr = `(1 - (_vector <=> $${vecParam}::vector))`;
        }
        orderClause = `ORDER BY ${scoreExpr} DESC`;
      } else if (query.q || query.term) {
        const tsParam = params.push(query.q ?? query.term ?? "");
        scoreExpr = `ts_rank(_fts, websearch_to_tsquery('simple', $${tsParam}))`;
        orderClause = `ORDER BY ${scoreExpr} DESC`;
      } else if (query.sort) {
        const sorts = Array.isArray(query.sort) ? query.sort : [query.sort];
        orderClause =
          "ORDER BY " +
          sorts.map((s) => `"${s.field}" ${s.order === "desc" ? "DESC" : "ASC"}`).join(", ");
        scoreExpr = "0";
      } else {
        scoreExpr = "0";
        orderClause = `ORDER BY "_created_at" DESC`;
      }

      const where = buildWhereClause(query.filters, params);

      // Also push FTS condition into WHERE when doing lexical search without a
      // vector so that _fts indexing is utilized
      let ftsWhere = "";
      if ((query.q || query.term) && !query.vector) {
        const tsParam = params.length; // already pushed above
        ftsWhere = where
          ? ` AND _fts @@ websearch_to_tsquery('simple', $${tsParam})`
          : `WHERE _fts @@ websearch_to_tsquery('simple', $${tsParam})`;
      }

      const limitParam = params.push(pageSize);
      const offsetParam = params.push(offset);

      const sql = `
        SELECT _data, _vector, ${scoreExpr} AS _score
        FROM ${table}
        ${where}${ftsWhere}
        ${orderClause}
        LIMIT $${limitParam} OFFSET $${offsetParam}
      `;

      const countSql = `SELECT COUNT(*) AS cnt FROM ${table} ${where}${ftsWhere}`;

      const [rowResult, countResult] = await Promise.all([
        db.query<Record<string, unknown>>(sql, params),
        db.query<{ cnt: string }>(countSql, params.slice(0, params.length - 2)),
      ]);

      const items: SearchDocument[] = rowResult.rows.map((row) => {
        const data = row._data as Record<string, unknown>;
        return {
          id: typeof data?.id === "string" ? data.id : String(data?.id ?? ""),
          ...data,
          _score: row._score,
        };
      });

      // Facets via GROUP BY
      let facets: FacetResult[] | undefined;
      if (query.facets && query.facets.length > 0) {
        facets = await computeFacets(table, query.facets, where, params.slice(0, params.length - 2));
      }

      return {
        items: items as SearchResult["items"],
        total: parseInt(String(countResult.rows[0]?.cnt ?? "0"), 10),
        page,
        pageSize,
        facets,
      };
    },

    async delete(indexName, id) {
      await db.query(`DELETE FROM ${tbl(indexName)} WHERE "id" = $1`, [id]);
    },

    async deleteWhere(indexName, filters) {
      const params: unknown[] = [];
      const where = buildWhereClause(filters, params);
      if (!where) return 0;
      const result = await db.query(
        `DELETE FROM ${tbl(indexName)} ${where}`,
        params,
      );
      return result.rowCount ?? 0;
    },

    async stats(indexName) {
      const result = await db.query<{ cnt: string }>(
        `SELECT COUNT(*) AS cnt FROM ${tbl(indexName)}`,
      );
      return { count: parseInt(String(result.rows[0]?.cnt ?? "0"), 10) };
    },
  };

  async function computeFacets(
    table: string,
    facets: FacetRequest[] | string[],
    where: string,
    params: unknown[],
  ): Promise<FacetResult[]> {
    const results: FacetResult[] = [];

    for (const f of facets as Array<string | FacetRequest>) {
      const field = typeof f === "string" ? f : f.field;
      const wantStats = typeof f !== "string" && f.stats;

      const p = [...params];
      const countSql = `
        SELECT "${field}" AS val, COUNT(*) AS cnt
        FROM ${table}
        ${where}
        GROUP BY "${field}"
        ORDER BY cnt DESC
        LIMIT 50
      `;

      const rows = await db
        .query<{ val: unknown; cnt: string }>(countSql, p)
        .catch(() => ({ rows: [] }));

      const values: FacetValue[] = rows.rows.map((r) => ({
        value: r.val as string | number | boolean,
        count: parseInt(String(r.cnt), 10),
      }));

      let stats: FacetResult["stats"];
      if (wantStats) {
        const statsSql = `
          SELECT MIN("${field}") AS mn, MAX("${field}") AS mx,
                 AVG("${field}") AS av, SUM("${field}") AS sm
          FROM ${table}
          ${where}
        `;
        const sr = await db
          .query<{ mn: unknown; mx: unknown; av: unknown; sm: unknown }>(statsSql, p)
          .catch(() => ({ rows: [] }));
        const s = sr.rows[0];
        if (s) {
          stats = {
            min: Number(s.mn ?? 0),
            max: Number(s.mx ?? 0),
            avg: Number(s.av ?? 0),
            sum: Number(s.sm ?? 0),
          };
        }
      }

      results.push({ field, values, stats });
    }

    return results;
  }
}
