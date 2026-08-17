// server/providers/database.ts
//
// Generic SQLite search provider — a third, zero-infra SQL option alongside
// postgres.ts/mysql.ts, for local dev or small deployments that don't want
// to stand up a full database server just for search. Prefers a real FTS5
// virtual table (SQLite's native full-text index) for real relevance
// ranking via bm25(); if the configured table isn't an FTS5 table, falls
// back to a LIKE-based search automatically (cached per table so we don't
// retry-and-fail on every request) — same graceful-degradation pattern as
// mysql.ts.
import Database from 'better-sqlite3'
import { useRuntimeConfig } from '#imports'
import type {
  FacetBucket,
  NumericOperator,
  ProviderSearchResult,
  SearchProvider,
  SearchProviderOptions,
} from './types'

type DatabaseConfig = {
  enabled: boolean
  filePath: string
  table: string
  idColumn: string
  searchColumns: string[]
}

function getConfig(): DatabaseConfig {
  const config = useRuntimeConfig()
  return (config.searchProviders as { database: DatabaseConfig }).database
}

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (_db) return _db
  const config = getConfig()
  _db = new Database(config.filePath)
  return _db
}

const IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/

/** Table/column names come from trusted deploy-time config, never a
 *  request — validated against an allowlist and quoted before
 *  interpolation, since SQLite has no placeholder syntax for identifiers. */
function quoteIdentifier(name: string): string {
  if (!IDENTIFIER_PATTERN.test(name)) {
    throw new Error(`Invalid SQLite identifier in search config: "${name}"`)
  }
  return `"${name}"`
}

const fts5AvailableByTable = new Map<string, boolean>()

type WhereBuilder = {
  clauses: string[]
  params: unknown[]
}

const RANGE_OPERATOR_SQL: Record<string, string> = {
  '>=': '>=',
  '<=': '<=',
  '>': '>',
  '<': '<',
  '=': '=',
  '!=': '!=',
}

function addFilterClauses(builder: WhereBuilder, options: SearchProviderOptions) {
  const filters = options.filters
  if (!filters) return

  const allRefinements = {
    ...(filters.facetsRefinements || {}),
    ...(filters.disjunctiveFacetsRefinements || {}),
  }

  for (const [field, values] of Object.entries(allRefinements)) {
    if (!Array.isArray(values) || !values.length) continue
    const placeholders = values.map(() => '?').join(', ')
    builder.clauses.push(`${quoteIdentifier(field)} IN (${placeholders})`)
    builder.params.push(...values)
  }

  for (const [field, operators] of Object.entries(filters.numericRefinements || {})) {
    if (!operators) continue
    for (const [operator, values] of Object.entries(operators) as [NumericOperator, Array<number | string>][]) {
      if (!Array.isArray(values) || !values.length) continue
      const sqlOperator = RANGE_OPERATOR_SQL[operator]
      if (!sqlOperator) continue

      const numericValues = values.map(Number).filter((value) => Number.isFinite(value))
      if (!numericValues.length) continue

      const candidate = sqlOperator === '>=' || sqlOperator === '>'
        ? Math.max(...numericValues)
        : Math.min(...numericValues)
      builder.clauses.push(`${quoteIdentifier(field)} ${sqlOperator} ?`)
      builder.params.push(candidate)
    }
  }
}

function buildTextSearchClause(
  options: SearchProviderOptions,
  config: DatabaseConfig,
  table: string,
  useFts: boolean,
): { scoreExpr: string, joinClause: string, whereClause: string | null, params: unknown[] } {
  if (!options.query) {
    return { scoreExpr: '1', joinClause: '', whereClause: null, params: [] }
  }

  if (useFts) {
    // FTS5 external-content pattern: the base table's rowid joins the
    // shadow FTS index, ranked by bm25() (lower is better, so it's negated
    // to match this codebase's "higher score = more relevant" convention).
    return {
      scoreExpr: `-bm25(${table}_fts)`,
      joinClause: `JOIN ${quoteIdentifier(`${config.table}_fts`)} AS ${table}_fts ON ${table}_fts.rowid = ${table}.rowid`,
      whereClause: `${table}_fts MATCH ?`,
      params: [options.query],
    }
  }

  const columns = options.fields?.length ? options.fields : config.searchColumns
  const likeClauses = columns.map((column) => `${quoteIdentifier(column)} LIKE ?`)
  return {
    scoreExpr: '1',
    joinClause: '',
    whereClause: `(${likeClauses.join(' OR ')})`,
    params: columns.map(() => `%${options.query}%`),
  }
}

export const databaseProvider: SearchProvider = {
  id: 'database',

  isEnabled() {
    return Boolean(getConfig()?.enabled)
  },

  async search(options: SearchProviderOptions): Promise<ProviderSearchResult> {
    const start = Date.now()
    const config = getConfig()
    const db = getDb()
    const table = quoteIdentifier(config.table)
    const pageSize = Math.max(1, options.pageSize)
    const offset = (Math.max(1, options.page) - 1) * pageSize

    let useFts = fts5AvailableByTable.get(config.table) ?? true

    const runWithFtsSetting = (fts: boolean) => {
      const builder: WhereBuilder = { clauses: [], params: [] }
      const text = buildTextSearchClause(options, config, table, fts)
      if (text.whereClause) {
        builder.clauses.push(text.whereClause)
        builder.params.push(...text.params)
      }
      addFilterClauses(builder, options)

      const where = builder.clauses.length ? `WHERE ${builder.clauses.join(' AND ')}` : ''
      const orderBy = options.sort
        ? `${quoteIdentifier(options.sort.field)} ${options.sort.direction === 'asc' ? 'ASC' : 'DESC'}`
        : '_score DESC'

      const sql = `
        SELECT ${table}.*, ${text.scoreExpr} AS _score, COUNT(*) OVER () AS _total
        FROM ${table}
        ${text.joinClause}
        ${where}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `
      return db.prepare(sql).all(...builder.params, pageSize, offset) as Array<Record<string, unknown>>
    }

    let rows: Array<Record<string, unknown>>
    try {
      rows = runWithFtsSetting(useFts)
      if (useFts) fts5AvailableByTable.set(config.table, true)
    } catch (error) {
      if (useFts) {
        fts5AvailableByTable.set(config.table, false)
        useFts = false
        rows = runWithFtsSetting(false)
      } else {
        throw error
      }
    }

    const total = rows.length ? Number(rows[0]?._total) : 0

    const facets: Record<string, FacetBucket[]> = {}
    if (options.facets?.length) {
      const facetBuilder: WhereBuilder = { clauses: [], params: [] }
      const text = buildTextSearchClause(options, config, table, useFts)
      if (text.whereClause) {
        facetBuilder.clauses.push(text.whereClause)
        facetBuilder.params.push(...text.params)
      }
      addFilterClauses(facetBuilder, options)
      const facetWhere = facetBuilder.clauses.length ? `WHERE ${facetBuilder.clauses.join(' AND ')}` : ''

      for (const field of options.facets) {
        const column = quoteIdentifier(field)
        const facetSql = `
          SELECT ${column} AS value, COUNT(*) AS count
          FROM ${table}
          ${text.joinClause}
          ${facetWhere}
          GROUP BY ${column}
          ORDER BY count DESC
          LIMIT 20
        `
        const facetRows = db.prepare(facetSql).all(...facetBuilder.params) as Array<{ value: unknown, count: number }>
        const buckets = facetRows
          .filter((row) => row.value !== null && row.value !== undefined)
          .map((row) => ({ value: String(row.value), count: Number(row.count) }))
        if (buckets.length) facets[field] = buckets
      }
    }

    return {
      provider: this.id,
      items: rows.map((row) => {
        const { _score, _total, ...source } = row
        const idValue = row[config.idColumn]
        return {
          id: idValue !== undefined && idValue !== null ? String(idValue) : '',
          score: Number(_score) || 0,
          source,
        }
      }),
      total,
      facets,
      tookMs: Date.now() - start,
    }
  },

  async searchFacetValues(field: string, facetQuery: string, options: SearchProviderOptions): Promise<FacetBucket[]> {
    const config = getConfig()
    const db = getDb()
    const table = quoteIdentifier(config.table)
    const column = quoteIdentifier(field)
    const useFts = fts5AvailableByTable.get(config.table) ?? true

    const builder: WhereBuilder = { clauses: [], params: [] }
    const text = buildTextSearchClause(options, config, table, useFts)
    if (text.whereClause) {
      builder.clauses.push(text.whereClause)
      builder.params.push(...text.params)
    }
    addFilterClauses(builder, options)

    if (facetQuery.trim()) {
      builder.clauses.push(`${column} LIKE ?`)
      builder.params.push(`%${facetQuery.trim()}%`)
    }

    const where = builder.clauses.length ? `WHERE ${builder.clauses.join(' AND ')}` : ''
    const sql = `
      SELECT ${column} AS value, COUNT(*) AS count
      FROM ${table}
      ${text.joinClause}
      ${where}
      GROUP BY ${column}
      ORDER BY count DESC
      LIMIT 10
    `
    const rows = db.prepare(sql).all(...builder.params) as Array<{ value: unknown, count: number }>
    return rows
      .filter((row) => row.value !== null && row.value !== undefined)
      .map((row) => ({ value: String(row.value), count: Number(row.count) }))
  },
}
