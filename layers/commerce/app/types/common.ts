// layers/commerce/app/types/common.ts
// Shared primitives used across commerce domain types.

export type ID = string

export type Maybe<T> = T | null

export interface Timestamps {
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface Money {
  value: number // minor-unit-agnostic numeric amount (e.g. 29.99)
  currencyCode: string // ISO 4217, e.g. 'GBP'
  formatted?: string // pre-formatted upstream, e.g. '£29.99'
}

export type MoneyInput = Money | number

export interface Currency {
  code: string // ISO 4217
  name: string
  symbol: string
  rate?: number // conversion rate relative to base currency
  isBase?: boolean
}

export type ISOCountryCode = string

export interface Address {
  id?: ID
  firstName?: string
  lastName?: string
  company?: string
  line1: string
  line2?: string
  city: string
  region?: string
  postalCode: string
  country: ISOCountryCode
  phone?: string
  email?: string
  type?: 'shipping' | 'billing' | 'default'
}

export interface MediaAsset {
  id?: ID
  url: string
  label?: string
  type?: 'image' | 'video' | 'document' | 'audio'
  position?: number
  disabled?: boolean
}

export interface SeoMetadata {
  title?: string
  description?: string
  keywords?: string[]
  slug?: string
  canonicalUrl?: string
  robots?: string
}

export type StockStatus = 'in_stock' | 'out_of_stock' | 'low_stock' | 'backorder' | 'preorder'

export interface PaginationParams {
  page?: number
  pageSize?: number
  limit?: number
  offset?: number
  sort?: string
  sortDirection?: 'asc' | 'desc'
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type FilterOperator = 'eq' | 'neq' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'between'

export interface FilterCondition {
  field: string
  operator?: FilterOperator
  value: unknown
}

export type FilterInput = Record<string, unknown> | FilterCondition[]
