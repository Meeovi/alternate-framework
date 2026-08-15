// server/providers/postgres.ts
//
// Generic Postgres full-text search provider. Works against any Postgres
// database, including Supabase (Supabase is Postgres — point
// ALTERNATE_SEARCH_PG_URL at its connection string and this provider needs
// nothing Supabase-specific).
//
// No schema changes are required: the tsvector is built inline from the
// configured search columns on every query. For large tables, add a
// generated `tsvector` column with a GIN index over the same expression and
// point this provider at a view/materialized column instead — the query
// shape here stays the same either way.
import pg from 'pg'
import { useRuntimeConfig } from '#imports'
import type {
  FacetBucket,
  NumericOperator,
  ProviderSearchResult,
  SearchProvider,
  SearchProviderOptions,
} from './types'

type PostgresConfig = {
  enabled: boolean
  connectionString: string
  ssl: string
  table: string
  idColumn: string
  searchColumns: string[]
}

function getConfig(): PostgresConfig {
  const config = useRuntimeConfig()
  return (config.searchProviders as { postgres: PostgresConfig }).postgres
}

let _pool: pg.Pool | null = null

function getPool(): pg.Pool {
  if (_pool) return _pool

  const config = getConfig()
  _pool = new pg.Pool({
    connectionString: config.connectionString,
    ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
    max: 5,
  })
  return _pool
}

const IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/

/**
 * Table/column names come from trusted deploy-time config, never from a
 * request — but they can't be parameterized like values can (Postgres has
 * no placeholder syntax for identifiers), so they're validated against a
 * strict allowlist pattern and quoted before being interpolated into SQL.
 */
function quoteIdentifier(name: string): string {
  if (!IDENTIFIER_PATTERN.test(name)) {
    throw new Error(`Invalid Postgres identifier in search config: "${name}"`)
  }
  return `"${name}"`
}

function buildTsVectorExpression(columns: string[]): string {
  const weights = ['A', 'B', 'C', 'D']
  return columns
    .map((column, index) => {
      const weight = weights[Math.min(index, weights.length - 1)]
      return `setweight(to_tsvector('simple', coalesce(${quoteIdentifier(column)}::text, '')), '${weight}')`
    })
    .join(' || ')
}

const RANGE_OPERATOR_SQL: Record<string, string> = {
  '>=': '>=',
  '<=': '<=',
  '>': '>',
  '<': '<',
  '=': '=',
  '!=': '!=',
}

type WhereBuilder = {
  clauses: string[]
  params: unknown[]
}

function pushParam(builder: WhereBuilder, value: unknown): string {
  builder.params.push(value)
  return `$${builder.params.length}`
}

function addFilterClauses(builder: WhereBuilder, options: SearchProviderOptions) {
  const filters = options.filters
  if (!filters) return

  const allRefinements = {
    ...(filters.facetsRefinements || {}),
    ...(filters.disjunctiveFacetsRefinements || {}),
  }

  for (const [field, values] of Object.entries(allRefinements)) {
    if (!Array.isArray(values) || values.length === 0) continue
    const placeholder = pushParam(builder, values)
    builder.clauses.push(`${quoteIdentifier(field)}::text = ANY(${placeholder}::text[])`)
  }

  for (const [field, operators] of Object.entries(filters.numericRefinements || {})) {
    if (!operators) continue
    for (const [operator, values] of Object.entries(operators) as [NumericOperator, Array<number | string>][]) {
      if (!Array.isArray(values) || values.length === 0) continue
      const sqlOperator = RANGE_OPERATOR_SQL[operator]
      if (!sqlOperator) continue

      const numericValues = values.map(Number).filter((value) => Number.isFinite(value))
      if (!numericValues.length) continue

      // Multiple values for the same operator collapse to the most
      // restrictive bound, matching the OpenSearch provider's behavior.
      const candidate = sqlOperator === '>=' || sqlOperator === '>'
        ? Math.max(...numericValues)
        : Math.min(...numericValues)
      const placeholder = pushParam(builder, candidate)
      builder.clauses.push(`${quoteIdentifier(field)} ${sqlOperator} ${placeholder}`)
    }
  }
}

function buildBaseQuery(options: SearchProviderOptions, config: PostgresConfig, builder: WhereBuilder) {
  const columns = options.fields?.length ? options.fields : config.searchColumns
  const tsVector = buildTsVectorExpression(columns)

  let scoreExpr = '1'
  if (options.query) {
    const queryPlaceholder = pushParam(builder, options.query)
    scoreExpr = `ts_rank_cd(${tsVector}, plainto_tsquery('simple', ${queryPlaceholder}))`
    builder.clauses.push(`(${tsVector}) @@ plainto_tsquery('simple', ${queryPlaceholder})`)
  }

  addFilterClauses(builder, options)

  const where = builder.clauses.length ? `WHERE ${builder.clauses.join(' AND ')}` : ''
  return { scoreExpr, where }
}

export const postgresProvider: SearchProvider = {
  id: 'postgres',

  isEnabled() {
    return Boolean(getConfig()?.enabled)
  },

  async search(options: SearchProviderOptions): Promise<ProviderSearchResult> {
    const start = Date.now()
    const config = getConfig()
    const pool = getPool()
    const table = quoteIdentifier(config.table)
    const pageSize = Math.max(1, options.pageSize)
    const offset = (Math.max(1, options.page) - 1) * pageSize

    const builder: WhereBuilder = { clauses: [], params: [] }
    const { scoreExpr, where } = buildBaseQuery(options, config, builder)

    const orderBy = options.sort
      ? `${quoteIdentifier(options.sort.field)} ${options.sort.direction === 'asc' ? 'ASC' : 'DESC'}`
      : '_score DESC'

    const limitPlaceholder = pushParam(builder, pageSize)
    const offsetPlaceholder = pushParam(builder, offset)

    const sql = `
      SELECT *, ${scoreExpr} AS _score, count(*) OVER () AS _total
      FROM ${table}
      ${where}
      ORDER BY ${orderBy}
      LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}
    `

    const result = await pool.query(sql, builder.params)
    const rows = result.rows as Array<Record<string, unknown>>
    const total = rows.length ? Number(rows[0]?._total) : 0

    const facets: Record<string, FacetBucket[]> = {}
    if (options.facets?.length) {
      const facetBuilder: WhereBuilder = { clauses: [], params: [] }
      const { where: facetWhere } = buildBaseQuery(options, config, facetBuilder)

      await Promise.all(options.facets.map(async (field) => {
        const column = quoteIdentifier(field)
        const facetSql = `
          SELECT ${column} AS value, count(*) AS count
          FROM ${table}
          ${facetWhere}
          GROUP BY ${column}
          ORDER BY count DESC
          LIMIT 20
        `
        const facetResult = await pool.query(facetSql, facetBuilder.params)
        const buckets = (facetResult.rows as Array<{ value: unknown, count: string }>)
          .filter((row) => row.value !== null && row.value !== undefined)
          .map((row) => ({ value: String(row.value), count: Number(row.count) }))
        if (buckets.length) facets[field] = buckets
      }))
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
    const pool = getPool()
    const table = quoteIdentifier(config.table)
    const column = quoteIdentifier(field)

    const builder: WhereBuilder = { clauses: [], params: [] }
    buildBaseQuery(options, config, builder)

    if (facetQuery.trim()) {
      const placeholder = pushParam(builder, `%${facetQuery.trim()}%`)
      builder.clauses.push(`${column}::text ILIKE ${placeholder}`)
    }

    const where = builder.clauses.length ? `WHERE ${builder.clauses.join(' AND ')}` : ''

    const sql = `
      SELECT ${column} AS value, count(*) AS count
      FROM ${table}
      ${where}
      GROUP BY ${column}
      ORDER BY count DESC
      LIMIT 10
    `
    const result = await pool.query(sql, builder.params)
    return (result.rows as Array<{ value: unknown, count: string }>)
      .filter((row) => row.value !== null && row.value !== undefined)
      .map((row) => ({ value: String(row.value), count: Number(row.count) }))
  },
}
