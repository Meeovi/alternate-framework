// packages/adapters/adapter-magento/src/normalizers/salesRules.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `sales_rules` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento sales rule structure.
export interface DirectusSalesRule {
  id: string
  name?: string
  description?: string
  coupon_type?: string
  uses_per_customer?: number
  uses_per_coupon?: number
  discount_amount?: number
  discount_qty?: number
  discount_step?: number
  simple_action?: string
  is_active?: boolean
  from_date?: string
  to_date?: string
  sort_order?: number
}

// Magento sales rule payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoSalesRule {
  rule_id: number | string
  name: string
  description?: string
  coupon_type: string
  uses_per_customer?: number
  uses_per_coupon?: number
  discount_amount?: number
  discount_qty?: number
  discount_step?: number
  simple_action: string
  is_active?: boolean
  from_date?: string
  to_date?: string
  sort_order?: number
}

export const normalizeMagentoSalesRule: Normalizer<RawMagentoSalesRule, DirectusSalesRule> = createNormalizer<RawMagentoSalesRule, DirectusSalesRule>({
  id: (src) => String(src?.rule_id ?? ''),
  name: (src) => src?.name ?? '',
  description: (src) => src?.description ?? '',
  coupon_type: (src) => src?.coupon_type ?? '',
  uses_per_customer: (src) => src?.uses_per_customer ?? 0,
  uses_per_coupon: (src) => src?.uses_per_coupon ?? 0,
  discount_amount: (src) => Number(src?.discount_amount ?? 0),
  discount_qty: (src) => Number(src?.discount_qty ?? 0),
  discount_step: (src) => Number(src?.discount_step ?? 0),
  simple_action: (src) => src?.simple_action ?? '',
  is_active: (src) => src?.is_active ?? false,
  from_date: (src) => src?.from_date ?? '',
  to_date: (src) => src?.to_date ?? '',
  sort_order: (src) => src?.sort_order ?? 0
})
