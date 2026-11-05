// server/api/search/facet-values.post.ts
//
// Powers ais-refinement-list's `searchable` prop (e.g. the brand filter's
// "Find brands" box in filters.vue) — InstantSearch calls
// searchClient.searchForFacetValues() as the user types, which
// useSearchClient.ts forwards here.
import { federatedSearchFacetValues, type FederatedSearchOptions } from '../../search/federate'
import { filtersFromBody } from '../../search/filters'

const MAX_QUERY_LENGTH = 512

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({})) || {}

  const facetName = String(body.facetName || '').trim()
  if (!facetName) {
    throw createError({ statusCode: 400, statusMessage: 'facetName is required' })
  }

  const facetQuery = String(body.facetQuery || '').trim().slice(0, MAX_QUERY_LENGTH)
  const searchString = String(body.q || '').trim().slice(0, MAX_QUERY_LENGTH)

  const options: FederatedSearchOptions = {
    query: searchString,
    page: 1,
    pageSize: 1,
    searchFilters: filtersFromBody(body),
  }

  // InstantSearch passes the tags it wants matches wrapped in; without a
  // `highlighted` value its list showed the matches with no names.
  const tag = (value: unknown, fallback: string) => (typeof value === 'string' && value.length <= 64 ? value : fallback)
  const highlight = { pre: tag(body.highlightPreTag, '<mark>'), post: tag(body.highlightPostTag, '</mark>') }

  const facetHits = await federatedSearchFacetValues(facetName, facetQuery, options, highlight)

  return {
    facetHits: facetHits.map((bucket) => ({ value: bucket.value, highlighted: bucket.highlighted ?? bucket.value, count: bucket.count, isRefined: false })),
  }
})
