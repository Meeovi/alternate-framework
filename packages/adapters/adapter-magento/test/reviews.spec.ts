import { describe, it, expect, vi } from 'vitest'
import { MagentoAdapter } from '../src/index'

describe('MagentoAdapter.commerce reviews', () => {
  describe('getProductReviews', () => {
    it('queries products(filter:{sku}) and returns the nested reviews.items array', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      magento.store.queryField = vi.fn().mockResolvedValueOnce({
        items: [{
          sku: 'TEST-SKU-1',
          review_count: 2,
          reviews: {
            average_rating: 4.5,
            items: [
              { nickname: 'Amelia', summary: 'Great!', text: 'Works well.', created_at: '2026-09-01', average_rating: 5 },
              { nickname: 'Tom', summary: 'Okay', text: 'Did the job.', created_at: '2026-08-20', average_rating: 4 },
            ],
          },
        }],
      })

      const result = await magento.commerce.getProductReviews('TEST-SKU-1')

      expect(magento.store.queryField).toHaveBeenCalledWith(
        'products',
        { filter: { sku: { eq: 'TEST-SKU-1' } }, pageSize: 20 },
        expect.anything(),
      )
      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({ nickname: 'Amelia', average_rating: 5 })
    })

    it('returns [] when the product has no reviews yet', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      magento.store.queryField = vi.fn().mockResolvedValueOnce({
        items: [{ sku: 'TEST-SKU-2', review_count: 0, reviews: { average_rating: 0, items: [] } }],
      })

      const result = await magento.commerce.getProductReviews('TEST-SKU-2')
      expect(result).toEqual([])
    })

    it('returns [] when no product matches the sku', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      magento.store.queryField = vi.fn().mockResolvedValueOnce({ items: [] })

      const result = await magento.commerce.getProductReviews('NO-SUCH-SKU')
      expect(result).toEqual([])
    })
  })

  describe('createProductReview', () => {
    it('mutates createProductReview with the given input', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      magento.store.mutateEntity = vi.fn().mockResolvedValueOnce({
        review: { nickname: 'Amelia', summary: 'Great!', text: 'Works well.', average_rating: 5 },
      })

      const input = {
        sku: 'TEST-SKU-1',
        nickname: 'Amelia',
        summary: 'Great!',
        text: 'Works well.',
        ratings: [{ id: 'MQ==', value_id: 'Mg==' }],
      }
      const result = await magento.commerce.createProductReview(input)

      expect(magento.store.mutateEntity).toHaveBeenCalledWith('createProductReview', { input }, expect.anything())
      expect(result).toEqual({ review: { nickname: 'Amelia', summary: 'Great!', text: 'Works well.', average_rating: 5 } })
    })
  })

  describe('getStoreConfig', () => {
    it('queries the storeConfig root field', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      magento.store.queryField = vi.fn().mockResolvedValueOnce({
        store_code: 'default', store_name: 'Meeovi', base_currency_code: 'USD',
      })

      const result = await magento.commerce.getStoreConfig()

      expect(magento.store.queryField).toHaveBeenCalledWith('storeConfig', {}, expect.anything())
      expect(result).toMatchObject({ store_name: 'Meeovi', base_currency_code: 'USD' })
    })
  })
})
