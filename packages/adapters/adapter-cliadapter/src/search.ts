import type { SearchAdapter } from '@meeovi/types/dist/search/adapter'
import type { TransportAdapter } from '@meeovi/types/dist/sdk/adapter'
import type { SearchQuery } from '@meeovi/types/dist/search/query'
import type { SearchResult } from '@meeovi/types/dist/search/result'
import type { Facet } from '@meeovi/types/dist/search/facet'
import type { Result } from '@meeovi/types/dist/core/result'
import { unwrap } from './utils.js'

export const createSearchAdapter = (
  transport: TransportAdapter
): SearchAdapter => ({
  async search(query: SearchQuery): Promise<SearchResult> {
    const res = await transport.request<SearchResult>('POST', '/search', { body: query })
    if (res.error) throw new Error(String(res.error))
    return res.data as SearchResult
  },

  // Note: SearchAdapter currently only requires `search(query): Promise<SearchResult>`
})
