import { describe, it, expect } from 'vitest'
import { normalizeProduct } from '../src/runtime/utils/normalizers/product'
import { normalizeCart } from '../src/runtime/utils/normalizers/cart'
import { normalizeCustomer } from '../src/runtime/utils/normalizers/customer'

describe('normalizers', () => {
  it('normalizes product from GQL shape', () => {
    const gql = {
      id: 1,
      sku: 'SKU123',
      name: 'Test Product',
      type_id: 'simple',
      price_range: { minimum_price: { regular_price: { value: 9.99 } } },
      media_gallery_entries: [{ file: '/img.jpg' }],
      custom_attributes: [{ attribute_code: 'description', value: 'desc' }]
    }

    const p = normalizeProduct(gql as any)
    expect(p).toEqual({
      id: 1,
      sku: 'SKU123',
      title: 'Test Product',
      description: 'desc',
      price: 9.99,
      images: ['/img.jpg'],
      type: 'simple'
    })
  })

  it('normalizes cart from GQL shape', () => {
    const gql = {
      id: 'cart1',
      items: [
        { id: '10', product: { sku: 'SKU1', name: 'One' }, quantity: 2, prices: { price: { value: 5 } } }
      ]
    }

    const c = normalizeCart(gql as any)
    expect(c.items[0]).toMatchObject({ sku: 'SKU1', qty: 2, name: 'One', price: 5 })
  })

  it('normalizes customer from GQL shape', () => {
    const gql = { id: 7, email: 'a@b.com', firstname: 'A', lastname: 'B' }
    const u = normalizeCustomer(gql as any)
    expect(u).toEqual({ id: 7, email: 'a@b.com', firstname: 'A', lastname: 'B' })
  })
})
