export interface SearchResultItem {
  id: string
  type: 'product' | 'category' | 'content' | string
  title: string
  description?: string
  image?: string
  url?: string
}

export interface SearchResultBase {
  items: SearchResultItem[]
  total: number
}

export type SearchResult<T = SearchResultItem> = {
  items: T[]
  total: number
}