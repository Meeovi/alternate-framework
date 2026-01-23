import { BaseAdapter, BaseAdapterConfig } from './common'

export interface CartAdapterConfig extends BaseAdapterConfig {
  provider: string
}

export interface CartItem {
  id: string
  productId: string
  quantity: number
  [key: string]: unknown
}

export interface Cart<TItem extends CartItem = CartItem> {
  id: string
  items: TItem[]
  [key: string]: unknown
}

export interface CartAdapter<TItem extends CartItem = CartItem>
  extends BaseAdapter<CartAdapterConfig> {
  type: 'cart'
  getCart(id: string): Promise<Cart<TItem> | null>
  addItem(cartId: string, item: TItem): Promise<Cart<TItem>>
  removeItem(cartId: string, itemId: string): Promise<Cart<TItem>>
  clearCart(cartId: string): Promise<Cart<TItem>>
}