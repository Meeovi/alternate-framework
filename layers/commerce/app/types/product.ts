export interface Price {
  value: number
  currency: string
}

export interface ProductVariant {
  id: string
  sku?: string
  price?: Price
  attributes?: Record<string, any>
}

export interface SimpleProduct {
  id: string
  title?: string
  description?: string
  images?: string[]
  price?: Price
  variants?: ProductVariant[]
}
export * from './index'
export type { ProductState } from './product-state'
