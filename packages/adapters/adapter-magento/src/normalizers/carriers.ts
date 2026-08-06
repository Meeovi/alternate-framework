// packages/adapters/adapter-magento/src/normalizers/carriers.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `carriers` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento carrier structure.
export interface DirectusCarrier {
  id: string
  name?: string
  code?: string
  status?: boolean
  sort_order?: number
}

// Magento carrier payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoCarrier {
  carrier_code: string
  carrier_name: string
  status?: boolean
  sort_order?: number
}

export const normalizeMagentoCarrier: Normalizer<RawMagentoCarrier, DirectusCarrier> = createNormalizer<RawMagentoCarrier, DirectusCarrier>({
  id: (src) => String(src?.carrier_code ?? ''),
  name: (src) => src?.carrier_name ?? '',
  code: (src) => src?.carrier_code ?? '',
  status: (src) => src?.status ?? false,
  sort_order: (src) => Number(src?.sort_order ?? 0)
})
