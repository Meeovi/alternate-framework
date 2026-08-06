// packages/adapters/adapter-magento/src/normalizers/tierPrices.ts
import { createNormalizer, type Normalizer } from './automapper'
import type { Mage_TierPrice } from '../graphql/schema-types'

// Directus has no dedicated `tier_prices` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento tier price structure.
export interface DirectusTierPrice {
  id: string
  product_id?: string
  product_sku?: string
  customer_group_id?: string
  qty?: number
  price?: number
  discount?: number
}

export const normalizeMagentoTierPrice: Normalizer<Mage_TierPrice, DirectusTierPrice> = createNormalizer<Mage_TierPrice, DirectusTierPrice>({
  id: (src) => String((src as any)?.id ?? ''),
  product_id: (src) => String((src as any)?.product_id ?? ''),
  product_sku: (src) => String((src as any)?.sku ?? ''),
  customer_group_id: (src) => String((src as any)?.customer_group_id ?? ''),
  qty: (src) => Number(src?.quantity ?? 0),
  price: (src) => Number((src as any)?.final_price?.value ?? 0),
  discount: (src) => Number((src as any)?.discount?.amount_off ?? 0)
})
