// packages/adapters/adapter-magento/src/normalizers/returns.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `returns` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento returns/RMA structure.
export interface DirectusReturn {
  id: string
  order_id?: string
  customer_id?: string
  status?: string
  reason?: string
  total_qty?: number
  total_amount?: number
  created_at?: string
  updated_at?: string
}

// Magento returns/RMA payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoReturn {
  entity_id: number | string
  order_id?: number | string
  customer_id?: number | string
  status: string
  reason?: string
  total_qty?: number
  total_amount?: number
  created_at?: string
  updated_at?: string
}

export const normalizeMagentoReturn: Normalizer<RawMagentoReturn, DirectusReturn> = createNormalizer<RawMagentoReturn, DirectusReturn>({
  id: (src) => String(src?.entity_id ?? ''),
  order_id: (src) => String(src?.order_id ?? ''),
  customer_id: (src) => String(src?.customer_id ?? ''),
  status: (src) => src?.status ?? 'pending',
  reason: (src) => src?.reason ?? '',
  total_qty: (src) => Number(src?.total_qty ?? 0),
  total_amount: (src) => Number(src?.total_amount ?? 0),
  created_at: (src) => src?.created_at ?? '',
  updated_at: (src) => src?.updated_at ?? ''
})
