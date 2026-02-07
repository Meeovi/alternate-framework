import type { PriceType } from '../../types/Price.type'

type ProductVariant = any

export interface Product {
  id: string
  title: string
  description: string
  images: string[]
  price: PriceType
  variants?: ProductVariant[]
}