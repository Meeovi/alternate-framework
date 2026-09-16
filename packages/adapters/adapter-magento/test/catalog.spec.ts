import { describe, it, expect, vi } from 'vitest'
import { MagentoAdapter } from '../src/index'

// Regression coverage for a real bug found via live testing: getProducts/
// getProductById/getProductBySku/getProductBySlug/getCategories/
// getCategory/getCategoryTree/getCatalogPriceBySku all routed through
// `store.readEntity`, which guesses a singular root field
// (Mage_Product/Product/product) that doesn't exist on Magento's real
// storefront schema — confirmed live it always threw. Fixed to go through
// `store.queryField` instead, targeting the real plural `products`/
// `categories` root fields (same pattern content.search/getProductReviews
// already used successfully). See test/live/catalog.live.spec.ts for the
// real-network confirmation.
describe('MagentoAdapter.commerce catalog reads', () => {
  describe('getProducts', () => {
    it('queries products(search:"") and returns items', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      magento.store.queryField = vi.fn().mockResolvedValueOnce({
        items: [{ sku: 'SKU1', name: 'Shoe' }],
        total_count: 1,
      })

      const result = await magento.commerce.getProducts()

      expect(magento.store.queryField).toHaveBeenCalledWith(
        'products',
        { search: '', pageSize: 20 },
        expect.anything(),
      )
      expect(result).toEqual([{ sku: 'SKU1', name: 'Shoe' }])
    })

    it('includes filter in the args only when non-empty', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      magento.store.queryField = vi.fn().mockResolvedValueOnce({ items: [], total_count: 0 })

      await magento.commerce.getProducts({ filter: { category_uid: { eq: 'cat-1' } } })

      expect(magento.store.queryField).toHaveBeenCalledWith(
        'products',
        { search: '', pageSize: 20, filter: { category_uid: { eq: 'cat-1' } } },
        expect.anything(),
      )
    })
  })

  describe('getProductBySku / getProductById / getProductBySlug', () => {
    it('getProductBySku filters by sku and returns the first item', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      magento.store.queryField = vi.fn().mockResolvedValueOnce({ items: [{ sku: 'SKU1', name: 'Shoe' }] })

      const result = await magento.commerce.getProductBySku('SKU1')

      expect(magento.store.queryField).toHaveBeenCalledWith(
        'products',
        { filter: { sku: { eq: 'SKU1' } }, pageSize: 1 },
        expect.anything(),
      )
      expect(result).toEqual({ sku: 'SKU1', name: 'Shoe' })
    })

    it('getProductBySku returns null when no product matches', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      magento.store.queryField = vi.fn().mockResolvedValueOnce({ items: [] })

      expect(await magento.commerce.getProductBySku('NO-SUCH-SKU')).toBeNull()
    })

    it('getProductById delegates to getProductBySku (no id filter exists on the real schema)', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      const bySku = vi.fn().mockResolvedValue({ sku: 'SKU1', name: 'Shoe' })
      magento.commerce.getProductBySku = bySku

      const result = await magento.commerce.getProductById('SKU1')

      expect(bySku).toHaveBeenCalledWith('SKU1')
      expect(result).toEqual({ sku: 'SKU1', name: 'Shoe' })
    })

    it('getProductBySlug filters by url_key', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      magento.store.queryField = vi.fn().mockResolvedValueOnce({ items: [{ sku: 'SKU1', url_key: 'shoe' }] })

      const result = await magento.commerce.getProductBySlug('shoe')

      expect(magento.store.queryField).toHaveBeenCalledWith(
        'products',
        { filter: { url_key: { eq: 'shoe' } }, pageSize: 1 },
        expect.anything(),
      )
      expect(result).toEqual({ sku: 'SKU1', url_key: 'shoe' })
    })
  })

  describe('getCategories / getCategory / getCategoryTree', () => {
    it('getCategories omits filters when none given', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      magento.store.queryField = vi.fn().mockResolvedValueOnce({ items: [{ id: '1', name: 'Root' }], total_count: 1 })

      const result = await magento.commerce.getCategories()

      expect(magento.store.queryField).toHaveBeenCalledWith('categories', { pageSize: 20 }, expect.anything())
      expect(result).toEqual([{ id: '1', name: 'Root' }])
    })

    it('getCategories includes filters when given', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      magento.store.queryField = vi.fn().mockResolvedValueOnce({ items: [], total_count: 0 })

      await magento.commerce.getCategories({ filter: { url_key: { eq: 'shoes' } } })

      expect(magento.store.queryField).toHaveBeenCalledWith(
        'categories',
        { pageSize: 20, filters: { url_key: { eq: 'shoes' } } },
        expect.anything(),
      )
    })

    it('getCategory filters by ids', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      magento.store.queryField = vi.fn().mockResolvedValueOnce({ items: [{ id: '5', name: 'Shoes' }] })

      const result = await magento.commerce.getCategory('5')

      expect(magento.store.queryField).toHaveBeenCalledWith(
        'categories',
        { filters: { ids: { eq: '5' } }, pageSize: 1 },
        expect.anything(),
      )
      expect(result).toEqual({ id: '5', name: 'Shoes' })
    })

    it('getCategoryTree returns items with nested children fields', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      magento.store.queryField = vi.fn().mockResolvedValueOnce({
        items: [{ id: '1', name: 'Root', children: [{ id: '2', name: 'Shoes' }] }],
      })

      const result = await magento.commerce.getCategoryTree()

      expect(result).toEqual([{ id: '1', name: 'Root', children: [{ id: '2', name: 'Shoes' }] }])
    })
  })

  describe('getCatalogPriceBySku / getCatalogPriceForProduct', () => {
    it('getCatalogPriceBySku filters by sku and requests price_range', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      magento.store.queryField = vi.fn().mockResolvedValueOnce({
        items: [{ sku: 'SKU1', price_range: { minimum_price: { final_price: { value: 19.99, currency: 'USD' } } } }],
      })

      const result = await magento.commerce.getCatalogPriceBySku('SKU1')

      expect(magento.store.queryField).toHaveBeenCalledWith(
        'products',
        { filter: { sku: { eq: 'SKU1' } }, pageSize: 1 },
        expect.anything(),
      )
      expect(result?.price_range?.minimum_price?.final_price?.value).toBe(19.99)
    })

    it('getCatalogPriceForProduct delegates to getCatalogPriceBySku', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      const bySku = vi.fn().mockResolvedValue({ sku: 'SKU1' })
      magento.commerce.getCatalogPriceBySku = bySku

      await magento.commerce.getCatalogPriceForProduct('SKU1')

      expect(bySku).toHaveBeenCalledWith('SKU1')
    })
  })
})
