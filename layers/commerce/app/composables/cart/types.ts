export interface CartItem {
  id: string
  quantity: number
  product: any
}

export interface Cart {
  id: string
  items: CartItem[]
  total: number
}

export interface CartProvider {
  getCart(): Promise<Cart>
  addItem(productId: string, quantity?: number): Promise<Cart>
  removeItem(productId: string): Promise<Cart>
  clearCart(): Promise<Cart>
}
