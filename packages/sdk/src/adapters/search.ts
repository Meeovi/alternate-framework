import type {
  SearchQuery,
  SearchResult,
  Facet,
  Result
} from '@meeovi/types'

export interface SearchAdapter {
  search<T = unknown>(query: SearchQuery): Promise<Result<SearchResult<T>>>
  facets(query: SearchQuery): Promise<Result<Facet[]>>
}