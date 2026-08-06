// packages/adapters/adapter-magento/src/normalizers/orderItems.ts
import { createNormalizer, type Normalizer } from './automapper'
import type { Mage_OrderItem } from '../graphql/schema-types'

// Directus has no dedicated `order_items` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento order item structure.
export interface DirectusOrderItem {
  id: string
  order_id?: string
  product_id?: string
  product_sku?: string
  product_name?: string
  product_type?: string
  qty_ordered?: number
  qty_invoiced?: number
  qty_shipped?: number
  qty_canceled?: number
  qty_refunded?: number
  qty_returned?: number
  price?: number
  product_sale_price?: number
  status?: string
}

export const normalizeMagentoOrderItem: Normalizer<Mage_OrderItem, DirectusOrderItem> = createNormalizer<Mage_OrderItem, DirectusOrderItem>({
  id: (src) => String(src?.id ?? ''),
  order_id: (src) => String((src as any)?.order_id ?? ''),
  product_id: (src) => String((src as any)?.product?.id ?? ''),
  product_sku: (src) => src?.product_sku ?? '',
  product_name: (src) => src?.product_name ?? '',
  product_type: (src) => src?.product_type ?? '',
  qty_ordered: (src) => Number(src?.quantity_ordered ?? 0),
  qty_invoiced: (src) => Number(src?.quantity_invoiced ?? 0),
  qty_shipped: (src) => Number(src?.quantity_shipped ?? 0),
  qty_canceled: (src) => Number(src?.quantity_canceled ?? 0),
  qty_refunded: (src) => Number(src?.quantity_refunded ?? 0),
  qty_returned: (src) => Number(src?.quantity_returned ?? 0),
  price: (src) => Number((src as any)?.prices?.price ?? 0),
  product_sale_price: (src) => Number(src?.product_sale_price?.value ?? 0),
  status: (src) => src?.status ?? ''
})
