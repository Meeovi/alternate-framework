import type { Result } from '../types'
import type { CommerceProduct, CommerceVariant } from '../types/commerce/product'
import type { CommerceCart } from '../types/commerce/cart'

type Product = CommerceProduct
type Cart = CommerceCart

export interface CommerceAdapter {
  getProduct(id: string): Promise<Result<Product>>
  listProducts(): Promise<Result<Product[]>>

  getCart(): Promise<Result<Cart>>
  addToCart(item: { productId: string; variantId?: string; quantity: number }): Promise<Result<Cart>>
  updateCartItem(itemId: string, quantity: number): Promise<Result<Cart>>
  removeCartItem(itemId: string): Promise<Result<Cart>>
  clearCart(): Promise<Result<Cart>>
}