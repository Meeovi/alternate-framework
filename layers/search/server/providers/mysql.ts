// server/providers/mysql.ts
//
// Generic MySQL 8+ full-text search provider (uses COUNT(*) OVER(), added
// in 8.0). Prefers native FULLTEXT search (MATCH ... AGAINST) for real
// relevance ranking; if the configured columns have no FULLTEXT index,
// MySQL raises error 1191 and this provider falls back to a LIKE-based
// search automatically (cached per table so we don't retry-and-fail on
// every request).
import mysql from 'mysql2/promise'
import { useRuntimeConfig } from '#imports'
import type {
  FacetBucket,
  NumericOperator,
  ProviderSearchResult,
  SearchProvider,
  SearchProviderOptions,
} from './types'

type MysqlConfig = {
  enabled: boolean
  connectionString: string
  table: string
  idColumn: string
  searchColumns: string[]
}

function getConfig(): MysqlConfig {
  const config = useRuntimeConfig()
  return (config.searchProviders as { mysql: MysqlConfig }).mysql
}

let _pool: mysql.Pool | null = null

function getPool(): mysql.Pool {
  if (_pool) return _pool
  const config = getConfig()
  _pool = mysql.createPool({ uri: config.connectionString, connectionLimit: 5 })
  return _pool
}

const NO_FULLTEXT_INDEX_ERRNO = 1191
const fulltextAvailableByTable = new Map<string, boolean>()

const IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/

/** Table/column names come from trusted deploy-time config, never a
 *  request — validated against an allowlist and backtick-quoted before
 *  interpolation, since MySQL has no placeholder syntax for identifiers. */
function quoteIdentifier(name: string): string {
  if (!IDENTIFIER_PATTERN.test(name)) {
    throw new Error(`Invalid MySQL identifier in search config: "${name}"`)
  }
  return `\`${name}\``
}

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
    if (!Array.isArray(values) || values.length === 0) continue
    builder.clauses.push(`${quoteIdentifier(field)} IN (?)`)
    builder.params.push(values)
  }

  for (const [field, operators] of Object.entries(filters.numericRefinements || {})) {
    if (!operators) continue
    for (const [operator, values] of Object.entries(operators) as [NumericOperator, Array<number | string>][]) {
      if (!Array.isArray(values) || values.length === 0) continue
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

function buildTextSearchClause(options: SearchProviderOptions, config: MysqlConfig, useFulltext: boolean): { scoreExpr: string, clause: string | null, params: unknown[] } {
  if (!options.query) {
    return { scoreExpr: '1', clause: null, params: [] }
  }

  // /api/search.ts always sends a generic, OpenSearch-shaped field list
  // (title/name/description/brand/category) as options.fields by default —
  // config.searchColumns (this provider's own deployment-configured ground
  // truth) takes priority, since the generic default previously overrode it
  // unconditionally and would query columns that don't exist in a
  // non-default schema. MySQL also has no OpenSearch-style "^N" boost
  // syntax — stripped rather than passed through to quoteIdentifier, which
  // would reject it outright.
  const columns = (config.searchColumns?.length ? config.searchColumns : options.fields ?? [])
    .map(field => field.replace(/\^\d+$/, ''))
  const columnList = columns.map(quoteIdentifier).join(', ')

  if (useFulltext) {
    const scoreExpr = `MATCH(${columnList}) AGAINST(? IN NATURAL LANGUAGE MODE)`
    return {
      scoreExpr,
      clause: `MATCH(${columnList}) AGAINST(? IN NATURAL LANGUAGE MODE)`,
      params: [options.query, options.query],
    }
  }

  const likeClauses = columns.map((column) => `${quoteIdentifier(column)} LIKE ?`)
  return {
    scoreExpr: '1',
    clause: `(${likeClauses.join(' OR ')})`,
    params: columns.map(() => `%${options.query}%`),
  }
}

async function runQuery(pool: mysql.Pool, sql: string, params: unknown[]) {
  const [rows] = await pool.query(sql, params)
  return rows as Array<Record<string, unknown>>
}

export const mysqlProvider: SearchProvider = {
  id: 'mysql',

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

    let useFulltext = fulltextAvailableByTable.get(config.table) ?? true

    async function runWithFulltextSetting(fulltext: boolean) {
      const builder: WhereBuilder = { clauses: [], params: [] }
      const text = buildTextSearchClause(options, config, fulltext)
      if (text.clause) {
        builder.clauses.push(text.clause)
        builder.params.push(...text.params)
      }
      addFilterClauses(builder, options)

      const where = builder.clauses.length ? `WHERE ${builder.clauses.join(' AND ')}` : ''
      const orderBy = options.sort
        ? `${quoteIdentifier(options.sort.field)} ${options.sort.direction === 'asc' ? 'ASC' : 'DESC'}`
        : '_score DESC'

      const sql = `
        SELECT *, ${text.scoreExpr} AS _score, COUNT(*) OVER () AS _total
        FROM ${table}
        ${where}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `
      return runQuery(pool, sql, [...builder.params, pageSize, offset])
    }

    let rows: Array<Record<string, unknown>>
    try {
      rows = await runWithFulltextSetting(useFulltext)
      if (useFulltext) fulltextAvailableByTable.set(config.table, true)
    } catch (error: unknown) {
      if (useFulltext && (error as { errno?: number }).errno === NO_FULLTEXT_INDEX_ERRNO) {
        fulltextAvailableByTable.set(config.table, false)
        useFulltext = false
        rows = await runWithFulltextSetting(false)
      } else {
        throw error
      }
    }

    const total = rows.length ? Number(rows[0]?._total) : 0

    const facets: Record<string, FacetBucket[]> = {}
    if (options.facets?.length) {
      const facetBuilder: WhereBuilder = { clauses: [], params: [] }
      const text = buildTextSearchClause(options, config, useFulltext)
      if (text.clause) {
        facetBuilder.clauses.push(text.clause)
        facetBuilder.params.push(...text.params)
      }
      addFilterClauses(facetBuilder, options)
      const facetWhere = facetBuilder.clauses.length ? `WHERE ${facetBuilder.clauses.join(' AND ')}` : ''

      // /api/search.ts's default facet list (category/brand/type) is just as
      // generic/OpenSearch-shaped as its default search fields — a
      // deployment's table may not have those columns. Promise.all
      // previously let one nonexistent-column query reject the whole batch,
      // which rejected search() itself and discarded the real hits already
      // fetched above. allSettled skips only the faceted fields that don't
      // exist, same as federate.ts already does one level up for whole
      // providers.
      await Promise.allSettled(options.facets.map(async (field) => {
        const column = quoteIdentifier(field)
        const facetSql = `
          SELECT ${column} AS value, COUNT(*) AS count
          FROM ${table}
          ${facetWhere}
          GROUP BY ${column}
          ORDER BY count DESC
          LIMIT 20
        `
        const facetRows = await runQuery(pool, facetSql, facetBuilder.params)
        const buckets = facetRows
          .filter((row) => row.value !== null && row.value !== undefined)
          .map((row) => ({ value: String(row.value), count: Number(row.count) }))
        if (buckets.length) facets[field] = buckets
      })).then((results) => {
        results.forEach((result, index) => {
          if (result.status !== 'rejected') return
          const field = options.facets![index]
          // MySQL errno 1054 = unknown column: expected noise when
          // /api/search.ts's generic facet defaults (category/brand/type)
          // don't match this deployment's actual schema — already handled
          // (the field is just skipped above), so warn instead of erroring.
          if ((result.reason as { errno?: number })?.errno === 1054) {
            console.warn(`[mysqlProvider] facet "${field}" skipped: column does not exist on "${config.table}"`)
          } else {
            console.error(`[mysqlProvider] facet "${field}" failed:`, result.reason)
          }
        })
      })
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
    const useFulltext = fulltextAvailableByTable.get(config.table) ?? true

    const builder: WhereBuilder = { clauses: [], params: [] }
    const text = buildTextSearchClause(options, config, useFulltext)
    if (text.clause) {
      builder.clauses.push(text.clause)
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
      ${where}
      GROUP BY ${column}
      ORDER BY count DESC
      LIMIT 10
    `
    const rows = await runQuery(pool, sql, builder.params)
    return rows
      .filter((row) => row.value !== null && row.value !== undefined)
      .map((row) => ({ value: String(row.value), count: Number(row.count) }))
  },
}
