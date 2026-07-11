// packages/adapters/adapter-magento/src/normalizers/orders.ts
import { createNormalizer } from './automapper'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusOrder = NonNullable<DirectusQuery['Directus_orders']>[0]

export interface RawMagentoOrder {
  increment_id: string
  grand_total: number
  status: string
  created_at: string
}

export const normalizeMagentoOrder = createNormalizer<RawMagentoOrder, DirectusOrder>({
  id: (src) => src?.increment_id ?? '',
  total_price: (src) => src?.grand_total ?? 0,
  lifecycle_status: (src) => src?.status ?? 'pending',
  date_created: (src) => src?.created_at ?? ''
})