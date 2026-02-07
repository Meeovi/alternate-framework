import type { BuiltSearchQuery } from '../core/QueryBuilder'

export interface MeeoviSearchItem {
  id: string
  title: string
  description?: string
  price?: number
  [key: string]: any
}

export type MeeoviSearchAdapter = {
  id?: string
  type?: string
  config?: any
  search(query: BuiltSearchQuery | any): Promise<{
    items: MeeoviSearchItem[]
    total: number
    page?: number
    pageSize?: number
  }>
}