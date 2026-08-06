// packages/adapters/adapter-magento/src/normalizers/customerAddresses.ts
import { createNormalizer, type Normalizer } from './automapper'
import type { Mage_CustomerAddress } from '../graphql/schema-types'

// Directus has no dedicated `customer_addresses` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento customer address structure.
export interface DirectusCustomerAddress {
  id: string
  customer_id?: string
  firstname?: string
  lastname?: string
  company?: string
  street?: string[]
  city?: string
  region?: string
  region_id?: string
  postcode?: string
  country_code?: string
  telephone?: string
  fax?: string
  vat_id?: string
  default_billing?: boolean
  default_shipping?: boolean
}

export const normalizeMagentoCustomerAddress: Normalizer<Mage_CustomerAddress, DirectusCustomerAddress> = createNormalizer<Mage_CustomerAddress, DirectusCustomerAddress>({
  id: (src) => String(src?.id ?? ''),
  customer_id: (src) => String((src as any)?.customer_id ?? ''),
  firstname: (src) => src?.firstname ?? '',
  lastname: (src) => src?.lastname ?? '',
  company: (src) => src?.company ?? '',
  street: (src) => src?.street ?? [],
  city: (src) => src?.city ?? '',
  region: (src) => src?.region?.region ?? '',
  region_id: (src) => String(src?.region_id ?? ''),
  postcode: (src) => src?.postcode ?? '',
  country_code: (src) => src?.country_code ?? '',
  telephone: (src) => src?.telephone ?? '',
  fax: (src) => src?.fax ?? '',
  vat_id: (src) => src?.vat_id ?? '',
  default_billing: (src) => src?.default_billing ?? false,
  default_shipping: (src) => src?.default_shipping ?? false
})
