import type { CommerceAdapter, TransportAdapter } from '@meeovi/sdk'
import type { CommerceProduct, CommerceCart, Result } from '@meeovi/types'
import { unwrap } from './utils'

export const createStarterCommerceAdapter = (
  transport: TransportAdapter
): CommerceAdapter => ({
  async getProduct(id: string): Promise<Result<CommerceProduct>> {
    const res = await transport.request<CommerceProduct>('GET', `/products/${id}`)
    return unwrap(res)
  },

  async listProducts(): Promise<Result<CommerceProduct[]>> {
    const res = await transport.request<CommerceProduct[]>('GET', '/products')
    return unwrap(res)
  },

  async getCart(): Promise<Result<CommerceCart>> {
    const res = await transport.request<CommerceCart>('GET', '/cart')
    return unwrap(res)
  },

  async addToCart(item: any): Promise<Result<CommerceCart>> {
    const res = await transport.request<CommerceCart>('POST', '/cart/items', {
      body: item
    })
    return unwrap(res)
  },

  async updateCartItem(id: any, quantity: any): Promise<Result<CommerceCart>> {
    const res = await transport.request<CommerceCart>('PATCH', `/cart/items/${id}`, {
      body: { quantity }
    })
    return unwrap(res)
  },

  async removeCartItem(id: any): Promise<Result<CommerceCart>> {
    const res = await transport.request<CommerceCart>('DELETE', `/cart/items/${id}`)
    return unwrap(res)
  },

  async clearCart(): Promise<Result<CommerceCart>> {
    const res = await transport.request<CommerceCart>('DELETE', '/cart')
    return unwrap(res)
  }
})