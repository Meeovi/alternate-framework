// packages/adapters/adapter-magento/src/normalizers/company.ts
import { createNormalizer } from './automapper'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusCompany = NonNullable<DirectusQuery['Directus_websites']>[0]

// Magento B2B Company extension attributes are not fully declared in codegen,
// so we define an explicit fallback raw shape here (mirrors vendors.ts).
export interface RawMagentoCompany {
  entity_id: number | string
  company_name?: string
  company_email?: string
  status?: number | string
  sales_representative_id?: number | string
}

export const normalizeMagentoCompany = createNormalizer<RawMagentoCompany, DirectusCompany>({
  id: (src) => String(src?.entity_id ?? ''),
  name: (src) => src?.company_name ?? '',
  slug: (src) => src?.company_email ?? '',
  description: (src) => src?.company_name ?? '',
  status: (src) => (src?.status ? 'active' : 'inactive'),
  type: () => 'company'
})
