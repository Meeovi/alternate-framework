// packages/adapters/adapter-magento/src/normalizers/customerGroups.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `customer_groups` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento customer group structure.
export interface DirectusCustomerGroup {
  id: string
  code?: string
  name?: string
  tax_class_id?: string
  tax_percent?: number
  customer_group_type?: string
}

// Magento customer group payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoCustomerGroup {
  id: number | string
  code: string
  name: string
  tax_class_id?: number | string
  tax_percent?: number
  customer_group_type?: string
}

export const normalizeMagentoCustomerGroup: Normalizer<RawMagentoCustomerGroup, DirectusCustomerGroup> = createNormalizer<RawMagentoCustomerGroup, DirectusCustomerGroup>({
  id: (src) => String(src?.id ?? ''),
  code: (src) => src?.code ?? '',
  name: (src) => src?.name ?? '',
  tax_class_id: (src) => String(src?.tax_class_id ?? ''),
  tax_percent: (src) => src?.tax_percent ?? 0,
  customer_group_type: (src) => src?.customer_group_type ?? 'general'
})
