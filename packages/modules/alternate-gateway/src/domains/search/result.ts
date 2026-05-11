export interface SearchResultItem {
  id: string
  type: 'product' | 'category' | 'content' | string
  title: string
  description?: string
  image?: string
  url?: string
}

export interface SearchResult<TItem = SearchResultItem> {
  items: TItem[]
  total: number
  // back-compat: some consumers expect totalPages
  totalPages?: number
  page: number
  pageSize: number
}