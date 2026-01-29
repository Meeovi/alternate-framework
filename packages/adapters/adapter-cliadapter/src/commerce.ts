import type { CommerceAdapter } from '@meeovi/types/dist/commerce/adapter'
import type { TransportAdapter } from '@meeovi/types/dist/sdk/adapter'
import type { CommerceProduct as Product } from '@meeovi/types/dist/commerce/product'
import type { CommerceCart as Cart } from '@meeovi/types/dist/commerce/cart'
import type { Result } from '@meeovi/types/dist/core/result'
import { unwrap } from './utils.js'

export const createCommerceAdapter = (
  transport: TransportAdapter
): CommerceAdapter => ({
  async getProductBySlug(slug: string) {
    const res = await transport.request<Product>('GET', `/products/slug/${slug}`)
    if (res.error) return null
    return res.data as Product
  },

  async getProducts(params: { search?: string; categoryId?: string; limit?: number; offset?: number }) {
    const res = await transport.request<Product[]>('GET', '/products', {
      query: params
    })
    if (res.error) return []
    return res.data as Product[]
  },

  async getCategoryTree() {
    const res = await transport.request<any[]>('GET', '/categories/tree')
    if (res.error) return []
    return res.data as any[]
  },

  async getCart(cartId: string) {
    const res = await transport.request<Cart>('GET', `/cart/${cartId}`)
    if (res.error) return null
    return res.data as Cart
  },

  async addToCart(cartId: string | null, input: { productId: string; quantity: number }) {
    const res = await transport.request<Cart>('POST', '/cart/items', {
      body: { cartId, ...input }
    })
    if (res.error) throw new Error(String(res.error))
    return res.data as Cart
  }
})
