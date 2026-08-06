// packages/adapters/adapter-magento/src/normalizers/stock.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `stock` collection in this schema, so we map to a
// lightweight local shape that mirrors the Magento stock/quantity structure.
export interface DirectusStock {
  id: string
  sku: string
  qty: number
  is_in_stock: boolean
}

// Magento stock/quantity payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoStock {
  product_id: number | string
  sku: string
  qty?: number
  is_in_stock?: boolean
}

export const normalizeMagentoStock: Normalizer<RawMagentoStock, DirectusStock> = createNormalizer<RawMagentoStock, DirectusStock>({
  id: (src) => String(src?.sku ?? ''),
  sku: (src) => src?.sku ?? '',
  qty: (src) => src?.qty ?? 0,
  is_in_stock: (src) => src?.is_in_stock ?? false
})
