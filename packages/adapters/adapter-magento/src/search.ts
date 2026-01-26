import type { SearchAdapter, TransportAdapter } from '@meeovi/sdk'
import type { SearchQuery, SearchResult, Facet, Result } from '@meeovi/types'
import { unwrap } from './utils'

export const createStarterSearchAdapter = (
  transport: TransportAdapter
): SearchAdapter => ({
  async search(query: SearchQuery): Promise<Result<SearchResult>> {
    const res = await transport.request<SearchResult>(
      'POST',
      '/search',
      { body: query }
    )
    return unwrap(res)
  },

  async facets(query: SearchQuery): Promise<Result<Facet[]>> {
    const res = await transport.request<Facet[]>(
      'POST',
      '/search/facets',
      { body: query }
    )
    return unwrap(res)
  }
})