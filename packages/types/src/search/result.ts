export interface SearchResultItem {
  id: string
  type: 'product' | 'category' | 'content' | string
  title: string
  description?: string
  image?: string
  url?: string
}

export interface SearchResult {
  items: SearchResultItem[]
  total: number
}