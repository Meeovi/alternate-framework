export interface SearchResult<T = unknown> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}