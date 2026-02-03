import type { Price, ProductVariant } from '../../types/product'

export interface Product {
  id: string
  title: string
  description: string
  images: string[]
  price: Price
  variants?: ProductVariant[]
}