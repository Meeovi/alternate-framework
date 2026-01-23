export interface Price {
  amount: number
  currency: string
  formatted?: string
}

export interface Variant {
  id: string
  sku?: string
  title: string
  price: Price
  available: boolean
  attributes?: Record<string, string>
}

export interface Product {
  id: string
  title: string
  description?: string
  slug: string
  images: string[]
  price: Price
  variants?: Variant[]
  tags?: string[]
  createdAt: string
  updatedAt: string
}