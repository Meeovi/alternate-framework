// packages/adapters/adapter-magento/src/normalizers/stock.ts
import { createNormalizer } from './automapper'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusStock = NonNullable<DirectusQuery['Directus_currency']>[0]

// Magento stock/quantity payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoStock {
  product_id: number | string
  sku: string
  qty?: number
  is_in_stock?: boolean
}

export const normalizeMagentoStock = createNormalizer<RawMagentoStock, DirectusStock>({
  id: (src) => src?.sku ?? '',
  code: (src) => src?.sku ?? '',
  name: (src) => src?.sku ?? '',
  symbol: (src) => (src?.is_in_stock ? '1' : '0')
})
