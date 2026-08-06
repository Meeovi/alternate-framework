// packages/adapters/adapter-magento/src/normalizers/company.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `companies` collection in this schema, so we map to a
// lightweight local shape that mirrors the Websites collection fields.
export interface DirectusCompany {
  id: string
  name: string
  slug: string
  description: string
  status: string
  type: string
}

// Magento B2B Company extension attributes are not fully declared in codegen,
// so we define an explicit fallback raw shape here (mirrors vendors.ts).
export interface RawMagentoCompany {
  entity_id: number | string
  company_name?: string
  company_email?: string
  status?: number | string
  sales_representative_id?: number | string
}

export const normalizeMagentoCompany: Normalizer<RawMagentoCompany, DirectusCompany> = createNormalizer<RawMagentoCompany, DirectusCompany>({
  id: (src) => String(src?.entity_id ?? ''),
  name: (src) => src?.company_name ?? '',
  slug: (src) => src?.company_email ?? '',
  description: (src) => src?.company_name ?? '',
  status: (src) => (src?.status ? 'active' : 'inactive'),
  type: () => 'company'
})
