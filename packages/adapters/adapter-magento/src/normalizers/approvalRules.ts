// packages/adapters/adapter-magento/src/normalizers/approvalRules.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `approval_rules` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento approval rule structure.
export interface DirectusApprovalRule {
  id: string
  name?: string
  status?: string
  company_id?: string
  created_at?: string
  updated_at?: string
}

// Magento approval rule payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoApprovalRule {
  entity_id: number | string
  name: string
  status?: string
  company_id?: number | string
  created_at?: string
  updated_at?: string
}

export const normalizeMagentoApprovalRule: Normalizer<RawMagentoApprovalRule, DirectusApprovalRule> = createNormalizer<RawMagentoApprovalRule, DirectusApprovalRule>({
  id: (src) => String(src?.entity_id ?? ''),
  name: (src) => src?.name ?? '',
  status: (src) => src?.status ?? 'active',
  company_id: (src) => String(src?.company_id ?? ''),
  created_at: (src) => src?.created_at ?? '',
  updated_at: (src) => src?.updated_at ?? ''
})
