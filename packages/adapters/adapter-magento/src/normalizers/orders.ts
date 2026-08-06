// packages/adapters/adapter-magento/src/normalizers/orders.ts
import { createNormalizer, type Normalizer } from './automapper'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusOrder = NonNullable<DirectusQuery['Directus_orders']>[0]

export interface RawMagentoOrder {
  entity_id: number | string
  increment_id: string
  grand_total: number
  status: string
  created_at: string
  customer_email?: string
  customer_firstname?: string
  customer_lastname?: string
  customer_is_guest?: number | string
  coupon_code?: string
  shipping_amount?: number
  tax_amount?: number
  subtotal?: number
  discount_amount?: number
  order_currency_code?: string
  store_name?: string
}

export const normalizeMagentoOrder: Normalizer<RawMagentoOrder, DirectusOrder> = createNormalizer<RawMagentoOrder, DirectusOrder>({
  id: (src) => String(src?.entity_id ?? src?.increment_id ?? ''),
  increment_id: (src) => src?.increment_id ?? '',
  grand_total: (src) => src?.grand_total ?? 0,
  status: (src) => src?.status ?? 'pending',
  date_created: (src) => src?.created_at ?? '',
  customer_email: (src) => src?.customer_email ?? '',
  customer_firstname: (src) => src?.customer_firstname ?? '',
  customer_lastname: (src) => src?.customer_lastname ?? '',
  customer_is_guest: (src) => src?.customer_is_guest ?? 0,
  coupon_code: (src) => src?.coupon_code ?? '',
  shipping_amount: (src) => src?.shipping_amount ?? 0,
  tax_amount: (src) => src?.tax_amount ?? 0,
  subtotal: (src) => src?.subtotal ?? 0,
  discount_amount: (src) => src?.discount_amount ?? 0,
  order_currency_code: (src) => src?.order_currency_code ?? '',
  store_name: (src) => src?.store_name ?? ''
})