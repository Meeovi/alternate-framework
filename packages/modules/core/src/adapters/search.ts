import { BaseAdapter, BaseAdapterConfig } from './common'

export interface SearchAdapterConfig extends BaseAdapterConfig {
  provider: string
}

export interface SearchQuery {
  term: string
  filters?: Record<string, unknown>
  page?: number
  pageSize?: number
}

export interface SearchResult<TItem = unknown> {
  items: TItem[]
  total: number
  page: number
  pageSize: number
}

export interface SearchAdapter<TItem = unknown>
  extends BaseAdapter<SearchAdapterConfig> {
  type: 'search'
  search(query: SearchQuery): Promise<SearchResult<TItem>>
  suggest?(term: string): Promise<string[]>
}