// TODO: Replace with types from shared contracts if needed
type SearchAdapter = any
type TransportAdapter = any
type SearchQuery = any
type SearchResult = any
type Facet = any
type Result = any
import { unwrap } from './utils'

// Provide a starter-style adapter factory so apps using the starter-adapter
// pattern can register this adapter via a transport layer.
export const createStarterSearchAdapter = (
  transport: TransportAdapter
): SearchAdapter => ({
  id: 'opensearch-starter-search',
  type: 'search',

  async search<T = unknown>(query: SearchQuery): Promise<SearchResult<T>> {
    const res = await transport.request<SearchResult<T>>('POST', '/search', { body: query })
    const result = unwrap(res)
    if (!result.ok) {
      throw new Error(result.error)
    }
    return result.data
  },

  async facets(query: SearchQuery): Promise<Result<Facet[]>> {
    const res = await transport.request<Facet[]>('POST', '/search/facets', { body: query })
    return unwrap(res)
  }
})

export default createStarterSearchAdapter
