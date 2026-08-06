// packages/adapters/adapter-magento/src/normalizers/companyAccounts.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `company_accounts` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento company account structure.
export interface DirectusCompanyAccount {
  id: string
  name?: string
  company_name?: string
  email?: string
  status?: string
  customer_id?: string
  created_at?: string
  updated_at?: string
}

// Magento company account payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoCompanyAccount {
  entity_id: number | string
  name: string
  company_name: string
  email?: string
  status?: string
  customer_id?: number | string
  created_at?: string
  updated_at?: string
}

export const normalizeMagentoCompanyAccount: Normalizer<RawMagentoCompanyAccount, DirectusCompanyAccount> = createNormalizer<RawMagentoCompanyAccount, DirectusCompanyAccount>({
  id: (src) => String(src?.entity_id ?? ''),
  name: (src) => src?.name ?? '',
  company_name: (src) => src?.company_name ?? '',
  email: (src) => src?.email ?? '',
  status: (src) => src?.status ?? 'active',
  customer_id: (src) => String(src?.customer_id ?? ''),
  created_at: (src) => src?.created_at ?? '',
  updated_at: (src) => src?.updated_at ?? ''
})
