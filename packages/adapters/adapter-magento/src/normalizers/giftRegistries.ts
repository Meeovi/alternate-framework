// packages/adapters/adapter-magento/src/normalizers/giftRegistries.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `gift_registries` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento gift registry structure.
export interface DirectusGiftRegistry {
  id: string
  customer_id?: string
  name?: string
  message?: string
  status?: string
  event_date?: string
  event_location?: string
}

// Magento gift registry payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoGiftRegistry {
  registry_id: number | string
  customer_id?: number | string
  name: string
  message?: string
  status?: string
  event_date?: string
  event_location?: string
}

export const normalizeMagentoGiftRegistry: Normalizer<RawMagentoGiftRegistry, DirectusGiftRegistry> = createNormalizer<RawMagentoGiftRegistry, DirectusGiftRegistry>({
  id: (src) => String(src?.registry_id ?? ''),
  customer_id: (src) => String(src?.customer_id ?? ''),
  name: (src) => src?.name ?? '',
  message: (src) => src?.message ?? '',
  status: (src) => src?.status ?? 'active',
  event_date: (src) => src?.event_date ?? '',
  event_location: (src) => src?.event_location ?? ''
})
