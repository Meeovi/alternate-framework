// server/providers/algolia.ts
//
// Federates Algolia into the shared SearchProvider contract. Algolia's own
// relevance engine and facet/filter query language are used as-is (real
// filters/facetFilters/numericFilters, not a reimplementation) — this file
// only translates SearchProviderOptions into Algolia's request shape and
// normalizes the response back.
import { algoliasearch } from 'algoliasearch'
import { useRuntimeConfig } from '#imports'
import type { NumericOperator, ProviderSearchResult, SearchProvider, SearchProviderOptions } from './types'

type AlgoliaConfig = {
  enabled: boolean
  appId: string
  apiKey: string
  indexName: string
}

function getConfig(): AlgoliaConfig {
  const config = useRuntimeConfig()
  return (config.searchProviders as { algolia: AlgoliaConfig }).algolia
}

let _client: ReturnType<typeof algoliasearch> | null = null

function getClient(config: AlgoliaConfig) {
  if (_client) return _client
  _client = algoliasearch(config.appId, config.apiKey)
  return _client
}

// Algolia's own facetFilters DSL: an outer array of ANDed conditions, where
// each condition is either a single "field:value" string or an ORed array
// of them — exactly the "OR within an attribute, AND across attributes"
// semantics SearchProviderFilters already documents.
function buildFacetFilters(filters: SearchProviderOptions['filters']): Array<string | string[]> {
  if (!filters) return []

  const allRefinements = {
    ...(filters.facetsRefinements || {}),
    ...(filters.disjunctiveFacetsRefinements || {}),
  }

  const facetFilters: Array<string | string[]> = []
  for (const [field, values] of Object.entries(allRefinements)) {
    if (!Array.isArray(values) || !values.length) continue
    facetFilters.push(values.map((value) => `${field}:${value}`))
  }
  return facetFilters
}

function buildNumericFilters(filters: SearchProviderOptions['filters']): string[] {
  if (!filters?.numericRefinements) return []

  const numericFilters: string[] = []
  for (const [field, operators] of Object.entries(filters.numericRefinements)) {
    if (!operators) continue
    for (const [operator, values] of Object.entries(operators) as [NumericOperator, Array<number | string>][]) {
      if (!Array.isArray(values) || !values.length) continue
      for (const value of values) {
        if (!Number.isFinite(Number(value))) continue
        numericFilters.push(`${field}${operator}${value}`)
      }
    }
  }
  return numericFilters
}

export const algoliaProvider: SearchProvider = {
  id: 'algolia',

  isEnabled() {
    const config = getConfig()
    return Boolean(config?.enabled && config.appId && config.apiKey)
  },

  async search(options: SearchProviderOptions): Promise<ProviderSearchResult> {
    const start = Date.now()
    const config = getConfig()
    const client = getClient(config)

    // Algolia has no per-query "sort by field" parameter — custom sort
    // orders are pre-configured replica indices (standard Algolia
    // convention: "<index>_<field>_<asc|desc>"). Targeting that replica by
    // name is the real mechanism, not a query-time option to fake.
    const indexName = options.sort
      ? `${config.indexName}_${options.sort.field}_${options.sort.direction}`
      : config.indexName

    const response = await client.searchSingleIndex({
      indexName,
      searchParams: {
        query: options.query,
        // Algolia paginates from page 0; every other provider in this
        // codebase uses SearchProviderOptions.page as 1-indexed.
        page: Math.max(0, options.page - 1),
        hitsPerPage: Math.max(1, options.pageSize),
        facets: options.facets?.length ? options.facets : undefined,
        facetFilters: buildFacetFilters(options.filters).length ? buildFacetFilters(options.filters) : undefined,
        numericFilters: buildNumericFilters(options.filters).length ? buildNumericFilters(options.filters) : undefined,
      },
    })

    const hits = 'hits' in response ? response.hits : []
    const nbHits = 'nbHits' in response ? response.nbHits ?? hits.length : hits.length
    const processingTimeMS = 'processingTimeMS' in response ? response.processingTimeMS : undefined
    const facetsResponse = 'facets' in response ? response.facets : undefined

    const facets: Record<string, Array<{ value: string, count: number }>> = {}
    if (facetsResponse) {
      for (const [field, values] of Object.entries(facetsResponse)) {
        facets[field] = Object.entries(values as Record<string, number>)
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count)
      }
    }

    return {
      provider: this.id,
      items: hits.map((hit) => {
        const { objectID, ...source } = hit as Record<string, unknown> & { objectID: string }
        return {
          id: objectID,
          // Algolia doesn't expose a raw numeric relevance score by
          // default (it would require getRankingInfo); hit order is
          // already relevance-sorted, so a simple descending-rank proxy
          // score preserves that order through federate.ts's own
          // normalization step.
          score: hits.length - hits.indexOf(hit),
          source,
        }
      }),
      total: nbHits,
      facets,
      tookMs: processingTimeMS ?? (Date.now() - start),
    }
  },

  async searchFacetValues(field, facetQuery, options: SearchProviderOptions) {
    const config = getConfig()
    const client = getClient(config)

    // SearchForFacetValuesRequest has no structured `query`/`facetFilters`
    // fields — Algolia expects the base search's own params encoded as a
    // URL query string via `params`, same as its plain REST API.
    const facetFilters = buildFacetFilters(options.filters)
    const params = new URLSearchParams({ query: options.query })
    if (facetFilters.length) params.set('facetFilters', JSON.stringify(facetFilters))

    const response = await client.searchForFacetValues({
      indexName: config.indexName,
      facetName: field,
      searchForFacetValuesRequest: {
        facetQuery,
        params: params.toString(),
      },
    })

    return response.facetHits
      .map((hit) => ({ value: hit.value, count: hit.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  },
}
