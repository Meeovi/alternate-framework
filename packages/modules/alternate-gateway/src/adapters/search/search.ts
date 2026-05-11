import type {
    BaseAdapter,
    BaseAdapterConfig
} from './common';
import type { Result, Facet, SearchQuery, SearchResult } from '../types'

export interface SearchAdapterConfig extends BaseAdapterConfig {
  provider: string
}

export interface SearchAdapter<TItem = unknown>
  extends BaseAdapter<SearchAdapterConfig> {
  type: 'search'
  search(query: SearchQuery): Promise<SearchResult<TItem>>
  suggest?(term: string): Promise<string[]>
  facets(query: SearchQuery): Promise<Result<Facet[]>>  
}