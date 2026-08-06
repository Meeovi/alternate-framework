// packages/adapters/adapter-magento/src/normalizers/productReviews.ts
import { createNormalizer, type Normalizer } from './automapper'
import type { Mage_ProductReview } from '../graphql/schema-types'

// Directus has no dedicated `product_reviews` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento product review structure.
export interface DirectusProductReview {
  id: string
  product_id?: string
  product_sku?: string
  customer_id?: string
  nickname?: string
  title?: string
  text?: string
  rating?: number
  average_rating?: number
  status?: string
  created_at?: string
}

export const normalizeMagentoProductReview: Normalizer<Mage_ProductReview, DirectusProductReview> = createNormalizer<Mage_ProductReview, DirectusProductReview>({
  id: (src) => String((src as any)?.id ?? ''),
  product_id: (src) => String((src as any)?.product?.id ?? ''),
  product_sku: (src) => (src as any)?.product?.sku ?? '',
  customer_id: (src) => String((src as any)?.customer_id ?? ''),
  nickname: (src) => src?.nickname ?? '',
  title: (src) => src?.summary ?? '',
  text: (src) => src?.text ?? '',
  rating: (src) => {
    const ratings = (src as any)?.ratings_breakdown ?? []
    if (ratings.length > 0 && ratings[0]?.value) {
      return Number(ratings[0].value)
    }
    return 0
  },
  average_rating: (src) => src?.average_rating ?? 0,
  status: () => 'pending',
  created_at: (src) => src?.created_at ?? ''
})
