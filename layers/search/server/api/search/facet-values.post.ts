// server/api/search/facet-values.post.ts
//
// Powers ais-refinement-list's `searchable` prop (e.g. the brand filter's
// "Find brands" box in filters.vue) — InstantSearch calls
// searchClient.searchForFacetValues() as the user types, which
// useSearchClient.ts forwards here.
import { federatedSearchFacetValues } from '../../search/federate'
import type { SearchProviderOptions } from '../../providers/types'

const MAX_QUERY_LENGTH = 512

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({})) || {}

  const facetName = String(body.facetName || '').trim()
  if (!facetName) {
    throw createError({ statusCode: 400, statusMessage: 'facetName is required' })
  }

  const facetQuery = String(body.facetQuery || '').trim().slice(0, MAX_QUERY_LENGTH)
  const searchString = String(body.q || '').trim().slice(0, MAX_QUERY_LENGTH)

  const options: SearchProviderOptions = {
    query: searchString,
    page: 1,
    pageSize: 1,
    filters: body.instantsearchFilters || body.filters || undefined,
  }

  const facetHits = await federatedSearchFacetValues(facetName, facetQuery, options)

  return {
    facetHits: facetHits.map((bucket) => ({ value: bucket.value, count: bucket.count, isRefined: false })),
  }
})
