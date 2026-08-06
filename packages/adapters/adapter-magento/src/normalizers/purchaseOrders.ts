// packages/adapters/adapter-magento/src/normalizers/purchaseOrders.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `purchase_orders` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento purchase order structure.
export interface DirectusPurchaseOrder {
  id: string
  name?: string
  status?: string
  total?: number
  customer_id?: string
  company_id?: string
  created_at?: string
  updated_at?: string
}

// Magento purchase order payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoPurchaseOrder {
  entity_id: number | string
  name: string
  status?: string
  total?: number
  customer_id?: number | string
  company_id?: number | string
  created_at?: string
  updated_at?: string
}

export const normalizeMagentoPurchaseOrder: Normalizer<RawMagentoPurchaseOrder, DirectusPurchaseOrder> = createNormalizer<RawMagentoPurchaseOrder, DirectusPurchaseOrder>({
  id: (src) => String(src?.entity_id ?? ''),
  name: (src) => src?.name ?? '',
  status: (src) => src?.status ?? 'pending',
  total: (src) => Number(src?.total ?? 0),
  customer_id: (src) => String(src?.customer_id ?? ''),
  company_id: (src) => String(src?.company_id ?? ''),
  created_at: (src) => src?.created_at ?? '',
  updated_at: (src) => src?.updated_at ?? ''
})
