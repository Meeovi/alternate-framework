// packages/adapters/adapter-magento/src/normalizers/inventory.ts
import { createNormalizer } from './automapper'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusInventory = NonNullable<DirectusQuery['Directus_currency']>[0]

// Magento MSI inventory sources/stock are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoInventory {
  sku: string
  qty?: number
  is_in_stock?: boolean
  source_code?: string
}

export const normalizeMagentoInventory = createNormalizer<RawMagentoInventory, DirectusInventory>({
  id: (src) => src?.sku ?? '',
  code: (src) => src?.source_code ?? '',
  name: (src) => src?.sku ?? '',
  symbol: (src) => (src?.is_in_stock ? '1' : '0')
})
