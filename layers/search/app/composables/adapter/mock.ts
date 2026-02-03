import { defineAlternateAdapter, type SearchAdapter, type SearchAdapterConfig, type SearchResult } from '@meeovi/core'
import type { MeeoviSearchItem } from './types'
import type { BuiltSearchQuery } from '../core/QueryBuilder'

export function createMockSearchAdapter(items: MeeoviSearchItem[] = []) {
  const cfg: SearchAdapterConfig = { provider: 'mock' }

  const adapter: SearchAdapter<MeeoviSearchItem> = {
    id: 'search:mock',
    type: 'search',
    config: cfg,

    async search(query: any): Promise<SearchResult<MeeoviSearchItem>> {
      const filtered = items.filter((item) =>
        item.title.toLowerCase().includes(String(query.term || '').toLowerCase())
      )

      return {
        items: filtered,
        total: filtered.length,
        page: 1,
        pageSize: filtered.length
      }
    }
  }

  return defineAlternateAdapter(adapter)
}