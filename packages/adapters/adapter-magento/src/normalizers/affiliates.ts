// packages/adapters/adapter-magento/src/normalizers/affiliates.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `affiliates` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento affiliate structure.
export interface DirectusAffiliate {
  id: string
  name?: string
  email?: string
  status?: string
  total_commission?: number
  created_at?: string
  updated_at?: string
}

// Magento affiliate payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoAffiliate {
  entity_id: number | string
  name: string
  email?: string
  status?: string
  total_commission?: number
  created_at?: string
  updated_at?: string
}

export const normalizeMagentoAffiliate: Normalizer<RawMagentoAffiliate, DirectusAffiliate> = createNormalizer<RawMagentoAffiliate, DirectusAffiliate>({
  id: (src) => String(src?.entity_id ?? ''),
  name: (src) => src?.name ?? '',
  email: (src) => src?.email ?? '',
  status: (src) => src?.status ?? 'active',
  total_commission: (src) => Number(src?.total_commission ?? 0),
  created_at: (src) => src?.created_at ?? '',
  updated_at: (src) => src?.updated_at ?? ''
})
