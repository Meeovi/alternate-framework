import type { SearchAdapter, SearchQuery, SearchResult, Facet, Result, TransportAdapter } from '@meeovi/core'
import { unwrap } from './utils.js'

export const createSearchAdapter = (
  transport: TransportAdapter
): SearchAdapter => ({
  id: 'adapter-cliadapter',
  type: 'search',
  async search(query: SearchQuery): Promise<SearchResult> {
    const res = await transport.request<SearchResult>('POST', '/search', { body: query })
    if (res.error) throw new Error(String(res.error))
    return res.data as SearchResult
  },

  // Note: SearchAdapter currently only requires `search(query): Promise<SearchResult>`
})
