import { CommerceCartItem } from "./cart"
import { CommercePrice } from "./product"

export interface Order {
  id: string
  items: CommerceCartItem[]
  subtotal: CommercePrice
  total: CommercePrice
  currency: string
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}