// packages/adapters/adapter-magento/src/normalizers/payments.ts
import { createNormalizer } from './automapper'
import type { Mage_SelectedPaymentMethod } from '../graphql/schema-types'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusPayment = NonNullable<DirectusQuery['Directus_payments']>[0]

export const normalizeMagentoPayment = createNormalizer<Mage_SelectedPaymentMethod, DirectusPayment>({
  id: (src) => src?.code ?? '',
  gateway: (src) => src?.code ?? '',
  description: (src) => src?.title ?? '',
  status: () => 'pending',
  amount: () => 0
})
