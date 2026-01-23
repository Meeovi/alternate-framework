import type { Price } from './product'
import type { CartItem } from './cart'

export interface Order {
  id: string
  items: CartItem[]
  subtotal: Price
  total: Price
  currency: string
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}