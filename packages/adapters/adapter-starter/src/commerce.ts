import type { CommerceAdapter, TransportAdapter } from 'alternate-gateway/adapters'
import type { Result } from 'alternate-gateway/types'
import type { CommerceProduct as Product } from 'alternate-gateway/types/commerce/product'
import type { CommerceCart as Cart } from 'alternate-gateway/types/commerce/cart'
import { unwrap } from './utils'

export const createStarterCommerceAdapter = (
  transport: TransportAdapter
): CommerceAdapter => ({
  async getProduct(id: string): Promise<Result<Product>> {
    const res = await transport.request<Product>('GET', `/products/${id}`)
    return unwrap(res)
  },

  async listProducts(): Promise<Result<Product[]>> {
    const res = await transport.request<Product[]>('GET', '/products')
    return unwrap(res)
  },

  async getCart(): Promise<Result<Cart>> {
    const res = await transport.request<Cart>('GET', '/cart')
    return unwrap(res)
  },

  async addToCart(item: any): Promise<Result<Cart>> {
    const res = await transport.request<Cart>('POST', '/cart/items', {
      body: item
    })
    return unwrap(res)
  },

  async updateCartItem(id: any, quantity: any): Promise<Result<Cart>> {
    const res = await transport.request<Cart>('PATCH', `/cart/items/${id}`, {
      body: { quantity }
    })
    return unwrap(res)
  },

  async removeCartItem(id: any): Promise<Result<Cart>> {
    const res = await transport.request<Cart>('DELETE', `/cart/items/${id}`)
    return unwrap(res)
  },

  async clearCart(): Promise<Result<Cart>> {
    const res = await transport.request<Cart>('DELETE', '/cart')
    return unwrap(res)
  }
})