export interface Product {
  id: string
  sku?: string
  title: string
  description?: string
  price?: number
  images?: string[]
  variants?: any[]
  attributes?: Record<string, any>
  [key: string]: any
}
