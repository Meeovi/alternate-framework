import type { SearchAdapter, TransportAdapter } from 'alternate-gateway/adapters'
import type { SearchQuery, SearchResult, Facet, Result } from 'alternate-gateway/types'
import { unwrap } from './utils'

export const createStarterSearchAdapter = (
  transport: TransportAdapter
): SearchAdapter => ({
  id: 'starter-search',
  type: 'search',

  async search<T>(query: SearchQuery): Promise<SearchResult<T>> {
    const res = await transport.request<SearchResult<T>>(
      'POST',
      '/search',
      { body: query }
    )
    const result = unwrap(res)
    if (!result.ok) {
      throw new Error(result.error)
    }
    return result.data
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