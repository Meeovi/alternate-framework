import type {
  Product,
  Cart,
  CartItem,
  Result
} from '@meeovi/types'

export interface CommerceAdapter {
  getProduct(id: string): Promise<Result<Product>>
  listProducts(): Promise<Result<Product[]>>

  getCart(): Promise<Result<Cart>>
  addToCart(item: { productId: string; variantId?: string; quantity: number }): Promise<Result<Cart>>
  updateCartItem(itemId: string, quantity: number): Promise<Result<Cart>>
  removeCartItem(itemId: string): Promise<Result<Cart>>
  clearCart(): Promise<Result<Cart>>
}