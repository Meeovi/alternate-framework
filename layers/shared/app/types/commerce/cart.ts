import { CommercePrice } from "./product"

export interface CommerceCartItem {
  id: string
  productId: string
  quantity: number
  price: CommercePrice
}

export interface CommerceCart {
  id: string
  items: CommerceCartItem[]
  total: CommercePrice
}