import type { SearchAdapter, SearchResult } from '@meeovi/core'
import type { BuiltSearchQuery } from '../core/QueryBuilder'

export interface MeeoviSearchItem {
  id: string
  title: string
  description?: string
  price?: number
  [key: string]: unknown
}

export type MeeoviSearchAdapter = SearchAdapter<MeeoviSearchItem> & {
  search(query: BuiltSearchQuery): Promise<SearchResult<MeeoviSearchItem>>
}