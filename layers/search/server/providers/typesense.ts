// server/providers/typesense.ts
//
// Federates Typesense into the shared SearchProvider contract. Uses
// Typesense's own filter_by/facet_by query language as-is — this file
// only translates SearchProviderOptions into that shape and normalizes the
// response back.
import Typesense, { type Client } from 'typesense'
import { useRuntimeConfig } from '#imports'
import type { NumericOperator, ProviderSearchResult, SearchProvider, SearchProviderOptions } from './types'

type TypesenseConfig = {
  enabled: boolean
  host: string
  port: number
  protocol: string
  apiKey: string
  collectionName: string
  idField: string
}

function getConfig(): TypesenseConfig {
  const config = useRuntimeConfig()
  return (config.searchProviders as { typesense: TypesenseConfig }).typesense
}

let _client: Client | null = null

function getClient(config: TypesenseConfig): Client {
  if (_client) return _client
  _client = new Typesense.Client({
    nodes: [{ host: config.host, port: config.port, protocol: config.protocol }],
    apiKey: config.apiKey,
    connectionTimeoutSeconds: 5,
  })
  return _client
}

const NUMERIC_OPERATOR_SQL: Record<NumericOperator, string> = {
  '=': ':=',
  '!=': ':!=',
  '<': ':<',
  '<=': ':<=',
  '>': ':>',
  '>=': ':>=',
}

// Typesense's filter_by: a single string, &&-joined across attributes,
// ||-joined within an attribute's own set of values — the same
// "OR within an attribute, AND across attributes" semantics
// SearchProviderFilters already documents.
function buildFilterBy(filters: SearchProviderOptions['filters']): string {
  const clauses: string[] = []

  const allRefinements = {
    ...(filters?.facetsRefinements || {}),
    ...(filters?.disjunctiveFacetsRefinements || {}),
  }
  for (const [field, values] of Object.entries(allRefinements)) {
    if (!Array.isArray(values) || !values.length) continue
    clauses.push(`${field}:[${values.join(',')}]`)
  }

  for (const [field, operators] of Object.entries(filters?.numericRefinements || {})) {
    if (!operators) continue
    for (const [operator, values] of Object.entries(operators) as [NumericOperator, Array<number | string>][]) {
      if (!Array.isArray(values) || !values.length) continue
      const suffix = NUMERIC_OPERATOR_SQL[operator]
      for (const value of values) {
        if (!Number.isFinite(Number(value))) continue
        clauses.push(`${field}${suffix}${Number(value)}`)
      }
    }
  }

  return clauses.join(' && ')
}

export const typesenseProvider: SearchProvider = {
  id: 'typesense',

  isEnabled() {
    const config = getConfig()
    return Boolean(config?.enabled && config.host)
  },

  async search(options: SearchProviderOptions): Promise<ProviderSearchResult> {
    const start = Date.now()
    const config = getConfig()
    const client = getClient(config)
    const queryBy = options.fields?.length ? options.fields.join(',') : '*'
    const filterBy = buildFilterBy(options.filters)

    const response = await client.collections(config.collectionName).documents().search({
      q: options.query || '*',
      query_by: queryBy,
      page: Math.max(1, options.page),
      per_page: Math.max(1, options.pageSize),
      facet_by: options.facets?.length ? options.facets.join(',') : undefined,
      filter_by: filterBy || undefined,
      sort_by: options.sort ? `${options.sort.field}:${options.sort.direction}` : undefined,
    })

    const facets: Record<string, Array<{ value: string, count: number }>> = {}
    for (const facetCount of response.facet_counts ?? []) {
      const field = String(facetCount.field_name)
      facets[field] = facetCount.counts
        .map((count) => ({ value: count.value, count: count.count }))
        .sort((a, b) => b.count - a.count)
    }

    const hits = response.hits ?? []
    return {
      provider: this.id,
      items: hits.map((hit) => {
        const document = hit.document as Record<string, unknown>
        return {
          id: String(document[config.idField] ?? ''),
          score: hit.text_match,
          source: document,
        }
      }),
      total: response.found,
      facets,
      tookMs: response.search_time_ms,
    }
  },

  async searchFacetValues(field, facetQuery, options: SearchProviderOptions) {
    const config = getConfig()
    const client = getClient(config)
    const filterBy = buildFilterBy(options.filters)

    const response = await client.collections(config.collectionName).documents().search({
      q: options.query || '*',
      query_by: options.fields?.length ? options.fields.join(',') : '*',
      facet_by: field,
      facet_query: `${field}:${facetQuery}`,
      filter_by: filterBy || undefined,
      per_page: 1,
    })

    const facetCount = (response.facet_counts ?? []).find((entry) => String(entry.field_name) === field)
    return (facetCount?.counts ?? [])
      .map((count) => ({ value: count.value, count: count.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  },
}
