import type { SearchAdapter, TransportAdapter } from '@mframework/sdk'
import type { SearchQuery, SearchResult, Facet, Result } from '@mframework/core'
import { unwrap } from './utils'

export const createStarterSearchAdapter = (
  transport: TransportAdapter
): SearchAdapter => ({
  async search<T = unknown>(query: SearchQuery): Promise<Result<SearchResult<T>>> {
    const res = await transport.request<SearchResult<T>>(
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