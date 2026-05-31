type SearchQuery = Record<string, unknown>
type SearchResult<T = unknown> = T
type Facet = Record<string, unknown>
type Result<T> = {
  ok: boolean
  data?: T
  error?: string
}

type TransportAdapter = {
  request: (method: string, path: string, options?: Record<string, unknown>) => Promise<any>
}

type SearchAdapter = {
  id: string
  type: 'search'
  search: <T = unknown>(query: SearchQuery) => Promise<SearchResult<T>>
  facets: (query: SearchQuery) => Promise<Result<Facet[]>>
}
import { unwrap } from './utils'

// Provide a starter-style adapter factory so apps using the starter-adapter
// pattern can register this adapter via a transport layer.
export const createStarterSearchAdapter = (
  transport: TransportAdapter
): SearchAdapter => ({
  id: 'opensearch-starter-search',
  type: 'search',

  async search<T = unknown>(query: SearchQuery): Promise<SearchResult<T>> {
    const res = await transport.request('POST', '/search', { body: query })
    const result = unwrap(res)
    if (!result.ok) {
      throw new Error(result.error || 'Search request failed')
    }
    return result.data as SearchResult<T>
  },

  async facets(query: SearchQuery): Promise<Result<Facet[]>> {
    const res = await transport.request('POST', '/search/facets', { body: query })
    return unwrap(res)
  }
})

export default createStarterSearchAdapter
