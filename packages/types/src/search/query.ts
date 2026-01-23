export interface SearchFilter {
  field: string
  value: string | number | boolean
}

export interface SortOption {
  field: string
  direction: 'asc' | 'desc'
}

export interface SearchQuery {
  q: string
  filters?: SearchFilter[]
  sort?: SortOption[]
  page?: number
  pageSize?: number
}