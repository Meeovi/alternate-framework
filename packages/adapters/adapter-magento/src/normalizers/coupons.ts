// packages/adapters/adapter-magento/src/normalizers/coupons.ts
import { createNormalizer, type Normalizer } from './automapper'
import type { Mage_AppliedCoupon } from '../graphql/schema-types'

// Directus has no dedicated `coupons` collection in this schema, so we map to a
// lightweight local shape that mirrors how the coupon code is surfaced.
export interface DirectusCoupon {
  code: string
  status?: string
}

export const normalizeMagentoCoupon: Normalizer<Mage_AppliedCoupon, DirectusCoupon> = createNormalizer<Mage_AppliedCoupon, DirectusCoupon>({
  code: (src) => src?.code ?? '',
  status: () => 'applied'
})
