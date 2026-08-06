// packages/adapters/adapter-magento/src/normalizers/reward.ts
import { createNormalizer, type Normalizer } from './automapper'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusReward = NonNullable<DirectusQuery['Directus_incentives']>[0]

// Magento reward points are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoReward {
  customer_id: number | string
  points_balance?: number
  currency_amount?: number
  expiration_date?: string
}

export const normalizeMagentoReward: Normalizer<RawMagentoReward, DirectusReward> = createNormalizer<RawMagentoReward, DirectusReward>({
  id: (src) => String(src?.customer_id ?? ''),
  amount: (src) => src?.currency_amount ?? 0,
  currency_code: (src) => (src as any)?.currency ?? null
})
