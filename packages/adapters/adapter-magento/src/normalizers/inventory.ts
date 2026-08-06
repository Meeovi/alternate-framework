// packages/adapters/adapter-magento/src/normalizers/inventory.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `inventory` collection in this schema, so we map to a
// lightweight local shape that mirrors the Magento MSI inventory structure.
export interface DirectusInventory {
  id: string
  sku: string
  qty: number
  is_in_stock: boolean
  source_code?: string
}

// Magento MSI inventory sources/stock are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoInventory {
  sku: string
  qty?: number
  is_in_stock?: boolean
  source_code?: string
}

export const normalizeMagentoInventory: Normalizer<RawMagentoInventory, DirectusInventory> = createNormalizer<RawMagentoInventory, DirectusInventory>({
  id: (src) => src?.sku ?? '',
  sku: (src) => src?.sku ?? '',
  qty: (src) => src?.qty ?? 0,
  is_in_stock: (src) => src?.is_in_stock ?? false,
  source_code: (src) => src?.source_code ?? ''
})
