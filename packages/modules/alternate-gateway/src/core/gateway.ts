import type { CartItem, CartTotals } from './commerce'

export interface CartGateway {
  get(): Promise<{ items: CartItem[]; totals: CartTotals }>
  add(productId: string, qty: number): Promise<void>
  remove(itemId: string): Promise<void>
  clear?(): Promise<void>
}

export interface ProductsGateway {
  list(params?: Record<string, unknown>): Promise<unknown[]>
  getById(id: string): Promise<unknown | null>
}

export interface OrdersGateway {
  list(params?: Record<string, unknown>): Promise<unknown[]>
  getById(id: string): Promise<unknown | null>
  create(payload: Record<string, unknown>): Promise<unknown>
}

export interface GatewayContract {
  cart: CartGateway
  products?: ProductsGateway
  orders?: OrdersGateway
  [key: string]: unknown
}
