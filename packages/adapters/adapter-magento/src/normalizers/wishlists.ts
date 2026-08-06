// packages/adapters/adapter-magento/src/normalizers/wishlists.ts
import { createNormalizer, type Normalizer } from './automapper'
import type { Mage_Wishlist } from '../graphql/schema-types'

// Directus has no dedicated `wishlists` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento wishlist structure.
export interface DirectusWishlist {
  id: string
  customer_id?: string
  sharing_code?: string
  items_count?: number
  updated_at?: string
}

export const normalizeMagentoWishlist: Normalizer<Mage_Wishlist, DirectusWishlist> = createNormalizer<Mage_Wishlist, DirectusWishlist>({
  id: (src) => String(src?.id ?? ''),
  customer_id: (src) => String((src as any)?.customer_id ?? ''),
  sharing_code: (src) => src?.sharing_code ?? '',
  items_count: (src) => src?.items_count ?? 0,
  updated_at: (src) => src?.updated_at ?? ''
})
