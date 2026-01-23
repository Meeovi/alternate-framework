import type { Price } from './product'

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  title: string
  quantity: number
  price: Price
  image?: string
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: Price
  total: Price
  currency: string
  updatedAt: string
}