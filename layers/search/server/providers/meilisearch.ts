// server/providers/meilisearch.ts
//
// Federates Meilisearch into the shared SearchProvider contract. Uses
// Meilisearch's own filter expression syntax and facetDistribution as-is —
// this file only translates SearchProviderOptions into that shape and
// normalizes the response back.
import { Meilisearch, type SearchParams } from 'meilisearch'
import { useRuntimeConfig } from '#imports'
import type { NumericOperator, ProviderSearchResult, SearchProvider, SearchProviderOptions } from './types'

type MeilisearchConfig = {
  enabled: boolean
  host: string
  apiKey: string
  indexUid: string
  idField: string
}

function getConfig(): MeilisearchConfig {
  const config = useRuntimeConfig()
  return (config.searchProviders as { meilisearch: MeilisearchConfig }).meilisearch
}

let _client: Meilisearch | null = null

function getClient(config: MeilisearchConfig): Meilisearch {
  if (_client) return _client
  _client = new Meilisearch({ host: config.host, apiKey: config.apiKey || undefined })
  return _client
}

const NUMERIC_OPERATOR_SQL: Record<NumericOperator, string> = {
  '=': '=',
  '!=': '!=',
  '<': '<',
  '<=': '<=',
  '>': '>',
  '>=': '>=',
}

// Meilisearch's filter expression: an array of ANDed groups, each either a
// single "field = value" string or an ORed array of them — the same
// "OR within an attribute, AND across attributes" semantics
// SearchProviderFilters already documents.
function buildFilter(filters: SearchProviderOptions['filters']): Array<string | string[]> {
  if (!filters) return []

  const clauses: Array<string | string[]> = []

  const allRefinements = {
    ...(filters.facetsRefinements || {}),
    ...(filters.disjunctiveFacetsRefinements || {}),
  }
  for (const [field, values] of Object.entries(allRefinements)) {
    if (!Array.isArray(values) || !values.length) continue
    clauses.push(values.map((value) => `${field} = "${String(value).replace(/"/g, '\\"')}"`))
  }

  for (const [field, operators] of Object.entries(filters.numericRefinements || {})) {
    if (!operators) continue
    for (const [operator, values] of Object.entries(operators) as [NumericOperator, Array<number | string>][]) {
      if (!Array.isArray(values) || !values.length) continue
      const sqlOperator = NUMERIC_OPERATOR_SQL[operator]
      for (const value of values) {
        if (!Number.isFinite(Number(value))) continue
        clauses.push(`${field} ${sqlOperator} ${Number(value)}`)
      }
    }
  }

  return clauses
}

export const meilisearchProvider: SearchProvider = {
  id: 'meilisearch',

  isEnabled() {
    const config = getConfig()
    return Boolean(config?.enabled && config.host)
  },

  async search(options: SearchProviderOptions): Promise<ProviderSearchResult> {
    const start = Date.now()
    const config = getConfig()
    const client = getClient(config)
    const index = client.index(config.indexUid)

    const filter = buildFilter(options.filters)
    const searchParams: SearchParams = {
      page: Math.max(1, options.page),
      hitsPerPage: Math.max(1, options.pageSize),
      facets: options.facets?.length ? options.facets : undefined,
      filter: filter.length ? filter : undefined,
      sort: options.sort ? [`${options.sort.field}:${options.sort.direction}`] : undefined,
    }
    const response = await index.search(options.query, searchParams)

    const facets: Record<string, Array<{ value: string, count: number }>> = {}
    if (response.facetDistribution) {
      for (const [field, values] of Object.entries(response.facetDistribution)) {
        facets[field] = Object.entries(values)
          .map(([value, count]) => ({ value, count: Number(count) }))
          .sort((a, b) => b.count - a.count)
      }
    }

    // SearchResponse's pagination fields are a conditional type keyed off
    // the *static* shape of the options object, which doesn't narrow
    // usefully here since searchParams is typed as the general SearchParams
    // union (see above) — finite (totalHits) and infinite (estimatedTotalHits)
    // pagination are both real, valid runtime shapes depending on what was
    // requested, so this checks for either rather than fighting the type.
    const pagination = response as unknown as { totalHits?: number, estimatedTotalHits?: number }
    const total = pagination.totalHits ?? pagination.estimatedTotalHits ?? response.hits.length

    return {
      provider: this.id,
      items: response.hits.map((hit, rank) => {
        const record = hit as Record<string, unknown>
        return {
          id: String(record[config.idField] ?? ''),
          // Meilisearch doesn't expose a raw numeric relevance score by
          // default (would require showRankingScore); hit order is already
          // relevance-sorted, so a descending-rank proxy score preserves
          // that order through federate.ts's own normalization step.
          score: response.hits.length - rank,
          source: record,
        }
      }),
      total,
      facets,
      tookMs: response.processingTimeMs,
    }
  },

  async searchFacetValues(field, facetQuery, options: SearchProviderOptions) {
    const config = getConfig()
    const client = getClient(config)
    const index = client.index(config.indexUid)

    const filter = buildFilter(options.filters)
    const response = await index.searchForFacetValues({
      facetName: field,
      facetQuery,
      q: options.query,
      filter: filter.length ? filter : undefined,
    })

    return response.facetHits
      .map((hit) => ({ value: hit.value, count: hit.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  },
}
