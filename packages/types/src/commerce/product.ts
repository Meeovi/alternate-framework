export interface CommercePrice {
  amount: number
  currency: string
}

export interface CommerceImage {
  url: string
  alt?: string
}

export interface CommerceProduct {
  id: string
  slug: string
  sku?: string
  name: string
  description?: string
  shortDescription?: string
  price: CommercePrice
  images: CommerceImage[]
  categories?: string[]
  variants?: CommerceVariant[]
  attributes?: Record<string, string | number | boolean>
}

export interface CommerceVariant {
  id: string
  sku?: string
  name?: string
  price?: CommercePrice
  attributes?: Record<string, string | number | boolean>
}