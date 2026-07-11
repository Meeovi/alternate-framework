// packages/adapters/adapter-magento/src/normalizers/quotes.ts
import { createNormalizer } from './automapper'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusQuote = NonNullable<DirectusQuery['Directus_cart']>[0]

// Magento quote/negotiable-quote payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoQuote {
  entity_id: number | string
  items?: Array<{ sku?: string; qty?: number }>
  grand_total?: number
  status?: string
}

export const normalizeMagentoQuote = createNormalizer<RawMagentoQuote, DirectusQuote>({
  id: (src) => String(src?.entity_id ?? ''),
  total: (src) => src?.grand_total ?? 0,
  items_count: (src) => src?.items?.length ?? 0,
  status: (src) => src?.status ?? 'active'
})
