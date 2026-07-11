// packages/adapters/adapter-magento/src/normalizers/invoice.ts
import { createNormalizer } from './automapper'
import type { Mage_Invoice } from '../graphql/schema-types'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusInvoice = NonNullable<DirectusQuery['Directus_invoices']>[0]

const money = (m?: { value?: number | null } | null): number =>
  m?.value ?? 0

export const normalizeMagentoInvoice = createNormalizer<Mage_Invoice, DirectusInvoice>({
  id: (src) => String(src?.id ?? ''),
  increment_id: (src) => src?.number ?? '',
  grand_total: (src) => money((src?.total as any)?.grand_total),
  subtotal: (src) => money((src?.total as any)?.subtotal),
  tax_amount: (src) => money((src?.total as any)?.total_tax),
  shipping_amount: (src) => money((src?.total as any)?.total_shipping),
  order_id: (src) => (src as any)?.order_id ?? null
})
