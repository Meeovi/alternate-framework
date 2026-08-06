// composables/useSearchClient.ts
import { computed } from 'vue'
import type { SearchResponse } from './useResults'

export function useSearchClient() {
  const searchClient = computed(() => ({
    search(requests: any[]) {
      const req = requests[0] || {}
      const params = req.params || {}
      const query = String(params.query || '')
      const page = Math.max(1, Number(params.page || 1))
      const hitsPerPage = Math.max(1, Number(params.hitsPerPage || 12))

      const filters = {
        facetsRefinements: params.facetsRefinements,
        disjunctiveFacetsRefinements: params.disjunctiveFacetsRefinements,
        numericRefinements: params.numericRefinements,
      }

      const body: any = {
        q: query,
        page,
        pageSize: hitsPerPage,
      }

      // Only attach filters if there are active refinements
      if (filters.facetsRefinements || filters.disjunctiveFacetsRefinements || filters.numericRefinements) {
        body.instantsearchFilters = filters
      }

      return $fetch<SearchResponse>('/api/search', {
        method: 'POST',
        body,
      })
        .then((data: SearchResponse) => {
          const items = Array.isArray(data?.items) ? data.items : []
          const total = Number(data?.total || 0)
          const facets = data?.facets || {}

          return {
            results: [
              {
                hits: items as Record<string, any>[],
                nbHits: total,
                page: page - 1,
                nbPages: Math.max(1, Math.ceil(total / hitsPerPage)),
                hitsPerPage,
                query,
                processingTimeMs: 10,
                params: '',
                facets,
                exhaustiveFacetsCount: true,
                exhaustiveNbHits: true,
              },
            ],
          }
        })
        .catch((error: any) => {
          console.error('[SearchClient] search failed:', error)
          return {
            results: [
              {
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
              },
            ],
          }
        })
    },

    searchForFacetValues(requests: any[]) {
      return Promise.resolve(requests.map(() => ({ facetHits: [] })))
    },
  }))

  return { searchClient }
}
