import type { BuiltSearchQuery } from "../core/QueryBuilder";

export type MeeoviSearchResult = {
  items: MeeoviSearchItem[]
  total: number
  page?: number
  pageSize?: number
  facets?: Record<string, any>
}

export type MeeoviSearchAdapter = {
  id: string
  type: string
  capabilities?: { search?: boolean }
  search(query: BuiltSearchQuery): Promise<MeeoviSearchResult>
}

export type MeeoviSearchItem = {
  id: string
  title: string
  description?: string
  price?: number
  [key: string]: unknown
}