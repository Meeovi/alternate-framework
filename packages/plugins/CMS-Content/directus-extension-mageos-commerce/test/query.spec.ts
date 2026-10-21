import { describe, expect, it } from 'vitest'
import { optionsKey, parseProductQuery, parseSkus, parseSlug } from '../src/query'

describe('parseProductQuery', () => {
  it('reads paging, filters and sort', () => {
    expect(parseProductQuery({ page: '2', limit: '500', search: ' jacket ', category: 'Mzg=', price_min: '10', price_max: '99.5', sku: 'A,B,A', sort: '-price' })).toEqual({
      page: 2, pageSize: 100, search: 'jacket', categoryId: 'Mzg=', priceMin: 10, priceMax: 99.5, skus: ['A', 'B'], sort: '-price',
    })
    expect(parseProductQuery({})).toEqual({ page: 1, pageSize: 20 })
    expect(parseProductQuery({ pageSize: '5', category_path: 'men/tops-men', sort: 'position' })).toEqual({ page: 1, pageSize: 5, categoryPath: 'men/tops-men', sort: 'position' })
  })

  it('rejects bad input with INVALID_QUERY', () => {
    for (const query of [{ page: '0' }, { limit: 'x' }, { sort: 'random' }, { sort: 'position' }, { price_min: '-1' }, { price_min: '50', price_max: '10' }, { category_path: '../etc' }, { search: 'x'.repeat(201) }]) {
      expect(() => parseProductQuery(query), JSON.stringify(query)).toThrow(expect.objectContaining({ code: 'INVALID_QUERY' }))
    }
  })
})

describe('parseSkus / parseSlug / optionsKey', () => {
  it('validates SKUs', () => {
    expect(parseSkus(['A-1', ' B ', 'A-1'], 50)).toEqual(['A-1', 'B'])
    expect(() => parseSkus(['a/b'], 50)).toThrow(/Invalid SKU/)
    expect(() => parseSkus(Array.from({ length: 51 }, (_, i) => `S${i}`), 50)).toThrow(/At most 50/)
  })

  it('validates slugs', () => {
    expect(parseSlug('beaumont-summit-kit')).toBe('beaumont-summit-kit')
    expect(() => parseSlug('../../admin')).toThrow()
    expect(() => parseSlug(undefined)).toThrow()
  })

  it('keys are independent of property order', () => {
    expect(optionsKey({ a: 1, b: { c: 2, d: 3 } })).toBe(optionsKey({ b: { d: 3, c: 2 }, a: 1 }))
    expect(optionsKey({ a: 1 })).not.toBe(optionsKey({ a: 2 }))
  })
})
