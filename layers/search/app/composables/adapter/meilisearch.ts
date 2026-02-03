import { defineAlternateAdapter, type SearchAdapter, type SearchAdapterConfig, type SearchResult } from '@meeovi/core'
import type { MeeoviSearchItem } from './types'
import type { BuiltSearchQuery } from '../core/QueryBuilder'

interface MeiliConfig extends SearchAdapterConfig {
  host: string
  apiKey?: string
  index: string
}

export function createMeilisearchAdapter(config: MeiliConfig) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`
  }

  const adapter: SearchAdapter<MeeoviSearchItem> = {
    id: 'search:meilisearch',
    type: 'search',
    config,

    async search(query: any): Promise<SearchResult<MeeoviSearchItem>> {
      const params = new URLSearchParams({
        q: query.term,
        offset: String((query.page - 1) * query.pageSize),
        limit: String(query.pageSize)
      })

      const res = await fetch(`${config.host}/indexes/${config.index}/search?${params}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filter: Object.entries(query.filters).map(([field, value]) => `${field} = ${value}`)
        })
      })

      const json = await res.json()

      return {
        items: json.hits as MeeoviSearchItem[],
        total: json.estimatedTotalHits ?? json.hits.length,
        page: query.page,
        pageSize: query.pageSize
      }
    }
  }

  return defineAlternateAdapter(adapter)
}