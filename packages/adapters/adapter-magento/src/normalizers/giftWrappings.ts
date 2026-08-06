// packages/adapters/adapter-magento/src/normalizers/giftWrappings.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `gift_wrappings` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento gift wrapping structure.
export interface DirectusGiftWrapping {
  id: string
  name?: string
  description?: string
  price?: number
  image?: string | null
  status?: string
}

// Magento gift wrapping payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoGiftWrapping {
  wrapping_id: number | string
  name: string
  description?: string
  price: number
  image?: string
  status?: number
}

export const normalizeMagentoGiftWrapping: Normalizer<RawMagentoGiftWrapping, DirectusGiftWrapping> = createNormalizer<RawMagentoGiftWrapping, DirectusGiftWrapping>({
  id: (src) => String(src?.wrapping_id ?? ''),
  name: (src) => src?.name ?? '',
  description: (src) => src?.description ?? '',
  price: (src) => Number(src?.price ?? 0),
  image: (src) => src?.image ?? null,
  status: (src) => (src?.status === 1 ? 'enabled' : 'disabled')
})
