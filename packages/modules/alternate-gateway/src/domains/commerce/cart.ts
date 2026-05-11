import type {
    CommercePrice
} from "./product";

export interface CommerceCartItem {
  id: string
  productId: string
  quantity: number
  price: CommercePrice
  [key: string]: unknown
}

export interface CommerceCart {
  id: string
  items: CommerceCartItem[]
  total: CommercePrice
  [key: string]: unknown
}