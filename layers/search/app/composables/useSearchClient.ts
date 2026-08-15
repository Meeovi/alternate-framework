// composables/useSearchClient.ts
import { computed, ref } from 'vue'

export type SearchResponse = {
  items?: Array<Record<string, unknown>>
  total?: number
  page?: number
  pageSize?: number
  facets?: Record<string, Record<string, number>>
  backends?: Array<{ provider: string, ok: boolean, tookMs: number | null, error?: string }>
  warning?: string
}

export type FacetValuesResponse = {
  facetHits?: Array<{ value: string, count: number, isRefined: boolean }>
}

type SearchRefinements = {
  facetsRefinements?: Record<string, string[]>
  disjunctiveFacetsRefinements?: Record<string, string[]>
  numericRefinements?: Record<string, Record<string, Array<number | string>>>
}

type SearchRequestParams = SearchRefinements & {
  query?: string
  page?: number
  hitsPerPage?: number
}

type SearchRequest = {
  indexName?: string
  params?: SearchRequestParams
}

type FacetValuesRequestParams = SearchRefinements & {
  query?: string
  facetName?: string
  facetQuery?: string
}

type FacetValuesRequest = {
  indexName?: string
  params?: FacetValuesRequestParams
}

type AlgoliaShapedHit = Record<string, unknown>

type AlgoliaShapedResult = {
  hits: AlgoliaShapedHit[]
  nbHits: number
  page: number
  nbPages: number
  hitsPerPage: number
  query: string
  processingTimeMs: number
  params: string
  facets: Record<string, Record<string, number>>
  exhaustiveFacetsCount: boolean
  exhaustiveNbHits: boolean
}

const SORT_DELIMITER = '__sort__'

/**
 * InstantSearch's sort-by widget selects among "virtual replica" index
 * names rather than sending a sort parameter directly. Since this app has a
 * single custom OpenSearch-backed index (no real Algolia-style replicas),
 * we encode the sort field/direction into a synthetic index name and decode
 * it back out here before calling the API.
 */
export function buildSortIndexName(baseIndex: string, field: string, direction: 'asc' | 'desc') {
  return `${baseIndex}${SORT_DELIMITER}${field}__${direction}`
}

function parseSortIndexName(indexName: string): { baseIndex: string, sort: { field: string, direction: 'asc' | 'desc' } | null } {
  const [baseIndex = indexName, suffix] = indexName.split(SORT_DELIMITER)
  if (!suffix) return { baseIndex, sort: null }

  const [field, direction] = suffix.split('__')
  if (!field || (direction !== 'asc' && direction !== 'desc')) {
    return { baseIndex, sort: null }
  }

  return { baseIndex, sort: { field, direction } }
}

function extractFilters(params: SearchRefinements | undefined) {
  if (!params) return undefined
  const { facetsRefinements, disjunctiveFacetsRefinements, numericRefinements } = params
  if (!facetsRefinements && !disjunctiveFacetsRefinements && !numericRefinements) return undefined
  return { facetsRefinements, disjunctiveFacetsRefinements, numericRefinements }
}

async function runSingleSearch(req: SearchRequest): Promise<AlgoliaShapedResult> {
  const params = req.params || {}
  const query = String(params.query || '')
  const page = Math.max(1, Number(params.page || 1))
  const hitsPerPage = Math.max(1, Number(params.hitsPerPage || 12))
  const { sort } = parseSortIndexName(String(req.indexName || ''))
  const filters = extractFilters(params)

  const body: Record<string, unknown> = { q: query, page, pageSize: hitsPerPage }
  if (filters) body.instantsearchFilters = filters
  if (sort) body.sort = sort

  try {
    const data = await $fetch<SearchResponse>('/api/search', { method: 'POST', body })
    const items = Array.isArray(data?.items) ? data.items : []
    const total = Number(data?.total || 0)

    return {
      hits: items,
      nbHits: total,
      page: page - 1,
      nbPages: Math.max(1, Math.ceil(total / hitsPerPage)),
      hitsPerPage,
      query,
      processingTimeMs: 10,
      params: '',
      facets: data?.facets || {},
      exhaustiveFacetsCount: true,
      exhaustiveNbHits: true,
    }
  } catch (error: unknown) {
    console.error('[SearchClient] search failed:', error)
    return {
      hits: [],
      nbHits: 0,
      page: 0,
      nbPages: 0,
      hitsPerPage,
      query,
      processingTimeMs: 0,
      params: '',
      facets: {},
      exhaustiveFacetsCount: true,
      exhaustiveNbHits: true,
    }
  }
}

async function runSingleFacetValuesSearch(req: FacetValuesRequest) {
  const params = req.params || {}
  const filters = extractFilters(params)

  const body: Record<string, unknown> = {
    q: String(params.query || ''),
    facetName: params.facetName || '',
    facetQuery: params.facetQuery || '',
  }
  if (filters) body.instantsearchFilters = filters

  try {
    const data = await $fetch<FacetValuesResponse>('/api/search/facet-values', { method: 'POST', body })
    return { facetHits: Array.isArray(data?.facetHits) ? data.facetHits : [] }
  } catch (error: unknown) {
    console.error('[SearchClient] searchForFacetValues failed:', error)
    return { facetHits: [] }
  }
}

export function useSearchClient() {
  const isLoading = ref(false)

  const searchClient = computed(() => ({
    // InstantSearch can batch more than one query into a single search()
    // call (e.g. multiple ais-index widgets on the same page) — every
    // request is run in parallel and results are returned 1:1 in order.
    async search(requests: SearchRequest[]) {
      isLoading.value = true
      try {
        const results = await Promise.all(requests.map(runSingleSearch))
        return { results }
      } finally {
        isLoading.value = false
      }
    },

    searchForFacetValues(requests: FacetValuesRequest[]) {
      return Promise.all(requests.map(runSingleFacetValuesSearch))
    },
  }))

  return { searchClient, isLoading }
}
