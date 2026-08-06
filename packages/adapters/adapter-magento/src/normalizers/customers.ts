// packages/adapters/adapter-magento/src/normalizers/customers.ts
import { createNormalizer, type Normalizer } from './automapper'
import type { Mage_Customer } from '../graphql/schema-types'

// `Directus_Directus_Users` is referenced by collections such as invoices,
// so we derive the element type from the invoices relation.
type DirectusCustomer = {
  id: string
  email?: string
  first_name?: string
  last_name?: string
  external_identifier?: string
  description?: string
  status?: string
  role?: string
}

export const normalizeMagentoCustomer: Normalizer<Mage_Customer, DirectusCustomer> = createNormalizer<Mage_Customer, DirectusCustomer>({
  id: (src) => String(src?.id ?? ''),
  email: (src) => src?.email ?? '',
  first_name: (src) => src?.firstname ?? '',
  last_name: (src) => src?.lastname ?? '',
  external_identifier: (src) => String(src?.id ?? ''),
  description: (src) => src?.prefix ?? '',
  status: () => 'active',
  role: () => '3c90a3e8-3e0c-4b3a-9b0a-3e0c4b3a9b0a'
})
