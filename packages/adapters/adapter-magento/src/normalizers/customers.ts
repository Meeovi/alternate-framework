// packages/adapters/adapter-magento/src/normalizers/customers.ts
import { createNormalizer } from './automapper'
import type { Mage_Customer } from '../graphql/schema-types'
import type { Query as DirectusQuery } from 'adapter-directus'

// `Directus_Directus_Users` is not a top-level Query field, but it is referenced
// by collections such as invoices, so we derive the element type from there.
type DirectusCustomer = NonNullable<NonNullable<DirectusQuery['Directus_invoices']>[0]['user']>

export const normalizeMagentoCustomer = createNormalizer<Mage_Customer, DirectusCustomer>({
  id: (src) => String(src?.id ?? ''),
  email: (src) => src?.email ?? '',
  first_name: (src) => src?.firstname ?? '',
  last_name: (src) => src?.lastname ?? '',
  external_identifier: (src) => String(src?.id ?? ''),
  description: (src) => src?.prefix ?? '',
  status: () => 'active',
  role: () => '3c90a3e8-3e0c-4b3a-9b0a-3e0c4b3a9b0a'
})
