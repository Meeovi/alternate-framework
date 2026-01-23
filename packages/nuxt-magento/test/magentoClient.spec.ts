import { describe, it, expect, vi } from 'vitest'
import { createMagentoClient } from '../src/runtime/magentoClient'

vi.mock('../src/runtime/utils/graphql', () => ({
  magentoGraphQL: async (_config: any, query: string, vars?: any) => {
    if (query.includes('products')) {
      return { products: { items: [ { id: 1, sku: 'S1', name: 'Prod', type_id: 'simple', price_range: { minimum_price: { regular_price: { value: 4 } } }, media_gallery_entries: [{ file: '/a.jpg' }], custom_attributes: [] } ] } }
    }
    if (query.includes('customer')) {
      return { customer: { id: 2, email: 'x@y.com', firstname: 'X', lastname: 'Y' } }
    }
    if (query.includes('createEmptyCart')) {
      return { createEmptyCart: 'cart-123' }
    }
    if (query.includes('addSimpleProductsToCart')) {
      return { addSimpleProductsToCart: { cart: { items: [ { id: '11', product: { sku: 'S1', name: 'Prod' }, quantity: 1, prices: { price: { value: 4 } } } ] } } }
    }
    return {}
  }
}))

describe('magento client (graph mocked)', () => {
  const client = createMagentoClient({ url: 'https://example.com' } as any)

  it('lists products via graphql and normalizes', async () => {
    const list = await client.products.list({ search: 'x' })
    expect(Array.isArray(list)).toBe(true)
    expect(list[0].sku).toBe('S1')
  })

  it('gets customer via graphql and normalizes', async () => {
    const c = await client.customer.me('token')
    expect(c.email).toBe('x@y.com')
  })

  it('createGuestCart returns id', async () => {
    const id = await client.cart.createGuestCart()
    expect(id).toBe('cart-123')
  })

  it('addItem returns normalized cart', async () => {
    const cart = await client.cart.addItem('cart-123', { sku: 'S1', qty: 1 })
    expect(cart.items[0].sku).toBe('S1')
  })
})
