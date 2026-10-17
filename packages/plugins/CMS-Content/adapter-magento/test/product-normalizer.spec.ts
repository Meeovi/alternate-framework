import { describe, expect, it } from 'vitest'
import { normalizeMagentoProduct } from '../src/normalizers/products'

const base = { sku: 'x', name: 'X', uid: 'MQ==', stock_status: 'IN_STOCK', price_range: { minimum_price: { final_price: { value: 4.99 } } } }

describe('normalizeMagentoProduct requires_shipping', () => {
  it('virtual and downloadable products never ship', () => {
    expect(normalizeMagentoProduct({ ...base, __typename: 'VirtualProduct' } as any).requires_shipping).toBe(false)
    expect(normalizeMagentoProduct({ ...base, __typename: 'DownloadableProduct' } as any).requires_shipping).toBe(false)
  })

  it('physical, unknown or untyped products ship', () => {
    expect(normalizeMagentoProduct({ ...base, __typename: 'SimpleProduct' } as any).requires_shipping).toBe(true)
    expect(normalizeMagentoProduct({ ...base, __typename: 'ConfigurableProduct' } as any).requires_shipping).toBe(true)
    expect(normalizeMagentoProduct(base as any).requires_shipping).toBe(true)
  })
})
