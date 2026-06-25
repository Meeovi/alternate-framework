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
// Driver interface
// ---------------------------------------------------------------------------

/**
 * Minimal synchronous or asynchronous SQLite-compatible interface.
 * Works with `better-sqlite3` (sync), `@libsql/client` (async), or any
 * wrapper that exposes execute/run/all.
 */
export type SqliteDatabase = {
  exec(sql: string): unknown;
  run(sql: string, params?: unknown[]): unknown;
  all<R = Record<string, unknown>>(sql: string, params?: unknown[]): R[] | Promise<R[]>;
  get<R = Record<string, unknown>>(sql: string, params?: unknown[]): R | undefined | Promise<R | undefined>;
};

export type SqliteAdapterConfig = {
  db: SqliteDatabase;
  /**
   * SQLite FTS5 tokenizer. Default "unicode61".
   * Options: "unicode61", "trigram", "ascii", "porter ascii"
   */
  tokenizer?: string;
};

/**
 * SQLite FTS5 search adapter.
 *
 * Features:
 * - Separate FTS5 virtual table per index for full-text search
 * - Main data table with JSON document storage
 * - BM25 ranking via FTS5 built-in `rank` column
 * - Prefix queries (append `*` to terms)
 * - Structured filter conditions (=, !=, <, <=, >, >=, IN, NOT IN)
 * - Multi-field sort
 * - Facet counts via GROUP BY
 * - Numeric facet stats (min/max/avg/sum)
 * - UPSERT via INSERT OR REPLACE
 * - deleteWhere via parameterised DELETE
 * - count() stats
 *
 * NOTE: Requires a SQLite version with FTS5 enabled (3.25+, most bundled
 * versions include it). Check with `PRAGMA compile_options` for FTS5.
 */
export function sqliteAdapter(config: SqliteAdapterConfig): SearchAdapter {
  const { db } = config;
  const tokenizer = config.tokenizer ?? "unicode61";

  // Per-index metadata: search fields and schema
  const indexMeta = new Map<string, { searchFields: string[] }>();

  function dataTbl(name: string): string {
    return `"_search_${name}"`;
  }

  function ftsTbl(name: string): string {
    return `"_fts_${name}"`;
  }

  function getSearchFields(indexName: string, schema: IndexSchema): string[] {
    const fromMap = Object.entries(schema.fieldMap ?? {})
      .filter(([, d]) => d.searchable !== false && d.type !== "vector")
      .map(([f]) => f);
    return fromMap.length > 0 ? fromMap : (schema.fields ?? ["id"]);
  }

  async function exec(sql: string): Promise<void> {
    await Promise.resolve(db.exec(sql));
  }

  async function run(sql: string, params: unknown[]): Promise<void> {
    await Promise.resolve(db.run(sql, params));
  }

  async function all<R = Record<string, unknown>>(
    sql: string,
    params: unknown[] = [],
  ): Promise<R[]> {
    return Promise.resolve(db.all<R>(sql, params));
  }

  async function get<R = Record<string, unknown>>(
    sql: string,
    params: unknown[] = [],
  ): Promise<R | undefined> {
    return Promise.resolve(db.get<R>(sql, params));
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
      switch (op) {
        case "=":  { params.push(v); return `json_extract(doc, '$.${f}') = ?`; }
        case "!=": { params.push(v); return `json_extract(doc, '$.${f}') != ?`; }
        case "<":  { params.push(v); return `CAST(json_extract(doc, '$.${f}') AS REAL) < ?`; }
        case "<=": { params.push(v); return `CAST(json_extract(doc, '$.${f}') AS REAL) <= ?`; }
        case ">":  { params.push(v); return `CAST(json_extract(doc, '$.${f}') AS REAL) > ?`; }
        case ">=": { params.push(v); return `CAST(json_extract(doc, '$.${f}') AS REAL) >= ?`; }
        case "IN": {
          const arr = Array.isArray(v) ? v : [v];
          arr.forEach((i) => params.push(i));
          return `json_extract(doc, '$.${f}') IN (${arr.map(() => "?").join(",")})`;
        }
        case "NOT IN": {
          const arr = Array.isArray(v) ? v : [v];
          arr.forEach((i) => params.push(i));
          return `json_extract(doc, '$.${f}') NOT IN (${arr.map(() => "?").join(",")})`;
        }
        default: { params.push(v); return `json_extract(doc, '$.${f}') = ?`; }
      }
    });

    return "WHERE " + parts.join(" AND ");
  }

  return {
    async setup(indexes: Record<string, IndexSchema>) {
      for (const [name, schema] of Object.entries(indexes)) {
        const searchFields = getSearchFields(name, schema);
        indexMeta.set(name, { searchFields });

        // Main data table
        await exec(`
          CREATE TABLE IF NOT EXISTS ${dataTbl(name)} (
            id   TEXT PRIMARY KEY,
            doc  TEXT NOT NULL DEFAULT '{}'
          )
        `);

        // FTS5 virtual table — content table backed by data table
        const ftsFields = searchFields.join(", ");
        await exec(`
          CREATE VIRTUAL TABLE IF NOT EXISTS ${ftsTbl(name)}
          USING fts5(
            id UNINDEXED,
            ${ftsFields},
            content=${dataTbl(name)},
            tokenize='${tokenizer} remove_diacritics 1'
          )
        `);

        // Triggers to keep FTS table in sync
        await exec(`
          CREATE TRIGGER IF NOT EXISTS "${name}_ai"
          AFTER INSERT ON ${dataTbl(name)} BEGIN
            INSERT INTO ${ftsTbl(name)}(rowid, id, ${ftsFields})
            VALUES (new.rowid, new.id, ${searchFields.map((f) => `json_extract(new.doc, '$.${f}')`).join(", ")});
          END
        `);
        await exec(`
          CREATE TRIGGER IF NOT EXISTS "${name}_au"
          AFTER UPDATE ON ${dataTbl(name)} BEGIN
            INSERT INTO ${ftsTbl(name)}(${ftsTbl(name)}, rowid, id, ${ftsFields})
            VALUES ('delete', old.rowid, old.id, ${searchFields.map((f) => `json_extract(old.doc, '$.${f}')`).join(", ")});
            INSERT INTO ${ftsTbl(name)}(rowid, id, ${ftsFields})
            VALUES (new.rowid, new.id, ${searchFields.map((f) => `json_extract(new.doc, '$.${f}')`).join(", ")});
          END
        `);
        await exec(`
          CREATE TRIGGER IF NOT EXISTS "${name}_ad"
          AFTER DELETE ON ${dataTbl(name)} BEGIN
            INSERT INTO ${ftsTbl(name)}(${ftsTbl(name)}, rowid, id, ${ftsFields})
            VALUES ('delete', old.rowid, old.id, ${searchFields.map((f) => `json_extract(old.doc, '$.${f}')`).join(", ")});
          END
        `);
      }
    },

    async index(indexName, docs, options?: AdapterIndexOptions) {
      const upsert = options?.upsert !== false ? "OR REPLACE" : "OR IGNORE";
      for (const doc of docs) {
        await run(
          `INSERT ${upsert} INTO ${dataTbl(indexName)} (id, doc) VALUES (?, ?)`,
          [String(doc.id ?? ""), JSON.stringify(doc)],
        );
      }
    },

    async query(indexName, query: SearchQuery): Promise<SearchResult> {
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? query.limit ?? 20;
      const offset = (page - 1) * pageSize;
      const q = query.q ?? query.term ?? "";
      const params: unknown[] = [];
      const filterParams: unknown[] = [];

      let items: SearchDocument[];
      let total = 0;

      if (q.trim()) {
        // Sanitize query for FTS5 (avoid syntax errors)
        const ftsQ = sanitizeFts5(q) + "*";
        params.push(ftsQ);
        const filterWhere = buildWhereClause(query.filters, filterParams);
        const filterJoin = filterWhere
          ? filterWhere.replace(/^WHERE/, "AND")
          : "";

        const sql = `
          SELECT d.doc, f.rank AS score
          FROM ${ftsTbl(indexName)} f
          JOIN ${dataTbl(indexName)} d ON d.id = f.id
          WHERE f.${ftsTbl(indexName)} MATCH ?
          ${filterJoin.replace(/json_extract\(doc,/g, "json_extract(d.doc,")}
          ORDER BY rank
          LIMIT ? OFFSET ?
        `;

        const countSql = `
          SELECT COUNT(*) AS cnt
          FROM ${ftsTbl(indexName)} f
          JOIN ${dataTbl(indexName)} d ON d.id = f.id
          WHERE f.${ftsTbl(indexName)} MATCH ?
          ${filterJoin.replace(/json_extract\(doc,/g, "json_extract(d.doc,")}
        `;

        const allParams = [...params, ...filterParams, pageSize, offset];
        const countParams = [...params, ...filterParams];

        const [rows, countRow] = await Promise.all([
          all<{ doc: string; score: number }>(sql, allParams),
          get<{ cnt: number }>(countSql, countParams),
        ]);

        items = rows.map((r) => JSON.parse(r.doc) as SearchDocument);
        total = countRow?.cnt ?? 0;
      } else {
        // No query — filter + sort only
        const where = buildWhereClause(query.filters, params);
        const sortClause = buildSortClause(query.sort);

        const sql = `
          SELECT doc FROM ${dataTbl(indexName)}
          ${where}
          ${sortClause}
          LIMIT ? OFFSET ?
        `;
        const countSql = `SELECT COUNT(*) AS cnt FROM ${dataTbl(indexName)} ${where}`;

        const allParams = [...params, pageSize, offset];
        const [rows, countRow] = await Promise.all([
          all<{ doc: string }>(sql, allParams),
          get<{ cnt: number }>(countSql, params),
        ]);

        items = rows.map((r) => JSON.parse(r.doc) as SearchDocument);
        total = countRow?.cnt ?? 0;
      }

      // Facets
      let facets: FacetResult[] | undefined;
      if (query.facets && query.facets.length > 0) {
        facets = await computeFacets(indexName, query.facets, query.filters);
      }

      return { items: items as SearchResult["items"], total, page, pageSize, facets };
    },

    async delete(indexName, id) {
      await run(`DELETE FROM ${dataTbl(indexName)} WHERE id = ?`, [id]);
    },

    async deleteWhere(indexName, filters) {
      const params: unknown[] = [];
      const where = buildWhereClause(filters, params);
      if (!where) return 0;
      const before = await get<{ cnt: number }>(
        `SELECT COUNT(*) AS cnt FROM ${dataTbl(indexName)} ${where}`,
        params,
      );
      await run(`DELETE FROM ${dataTbl(indexName)} ${where}`, params);
      return before?.cnt ?? 0;
    },

    async stats(indexName) {
      const row = await get<{ cnt: number }>(
        `SELECT COUNT(*) AS cnt FROM ${dataTbl(indexName)}`,
      );
      return { count: row?.cnt ?? 0 };
    },
  };

  async function computeFacets(
    indexName: string,
    facets: FacetRequest[] | string[],
    filters?: FilterCondition[] | Record<string, unknown>,
  ): Promise<FacetResult[]> {
    const results: FacetResult[] = [];

    for (const f of facets as Array<string | FacetRequest>) {
      const field = typeof f === "string" ? f : f.field;
      const wantStats = typeof f !== "string" && f.stats;

      const params: unknown[] = [];
      const where = buildWhereClause(filters, params);

      const rows = await all<{ val: unknown; cnt: number }>(
        `SELECT json_extract(doc, '$.${field}') AS val, COUNT(*) AS cnt
         FROM ${dataTbl(indexName)}
         ${where}
         GROUP BY val
         ORDER BY cnt DESC
         LIMIT 50`,
        params,
      );

      const values: FacetValue[] = rows.map((r) => ({
        value: r.val as string | number | boolean,
        count: r.cnt,
      }));

      let stats: FacetResult["stats"];
      if (wantStats) {
        const sp: unknown[] = [];
        const sw = buildWhereClause(filters, sp);
        const sr = await get<{ mn: number; mx: number; av: number; sm: number }>(
          `SELECT
            MIN(CAST(json_extract(doc, '$.${field}') AS REAL)) AS mn,
            MAX(CAST(json_extract(doc, '$.${field}') AS REAL)) AS mx,
            AVG(CAST(json_extract(doc, '$.${field}') AS REAL)) AS av,
            SUM(CAST(json_extract(doc, '$.${field}') AS REAL)) AS sm
           FROM ${dataTbl(indexName)} ${sw}`,
          sp,
        );
        if (sr) {
          stats = { min: sr.mn ?? 0, max: sr.mx ?? 0, avg: sr.av ?? 0, sum: sr.sm ?? 0 };
        }
      }

      results.push({ field, values, stats });
    }

    return results;
  }
}

function buildSortClause(sort?: SearchQuery["sort"]): string {
  if (!sort) return "";
  const arr = Array.isArray(sort) ? sort : [sort];
  const parts = arr.map((s) => `json_extract(doc, '$.${s.field}') ${s.order === "desc" ? "DESC" : "ASC"}`);
  return "ORDER BY " + parts.join(", ");
}

/** Escape special FTS5 characters to prevent query parse errors. */
function sanitizeFts5(q: string): string {
  // Remove FTS5 operators except for prefix wildcard handling
  return q.replace(/['"^*()]/g, " ").trim().replace(/\s+/g, " ");
}
