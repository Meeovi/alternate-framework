// packages/adapters/adapter-magento/src/normalizers/gifts.ts
import { createNormalizer, type Normalizer } from './automapper'
import type { Mage_GiftMessage } from '../graphql/schema-types'

// Directus has no dedicated `gifts` collection in this schema, so we map to a
// lightweight local shape that mirrors the Magento gift message structure.
export interface DirectusGift {
  from: string
  to: string
  message: string
}

export const normalizeMagentoGift: Normalizer<Mage_GiftMessage, DirectusGift> = createNormalizer<Mage_GiftMessage, DirectusGift>({
  from: (src) => src?.from ?? '',
  to: (src) => src?.to ?? '',
  message: (src) => src?.message ?? ''
})
