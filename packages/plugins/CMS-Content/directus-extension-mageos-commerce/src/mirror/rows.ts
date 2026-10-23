import { cents, magentoDate, toAdminOrder } from '../adapters/mage-os.mappers'
import type { NormalizedCategory, NormalizedProduct } from '../types'

/**
 * Store records as rows of the Directus collections they mirror into.
 * Only the fields named here are written; everything else on a row
 * (images, relations, CMS copy…) is left as the editors set it.
 */

/** products: matched on mageos_id. `stock` only when the live quantity is known. */
export function productRow(product: NormalizedProduct, qty: number | undefined, syncedAt: string) {
  return {
    source: 'magento',
    mageos_id: product.id,
    mageos_sku: product.sku,
    name: product.name,
    price: product.price?.final ?? 0,
    status: 'published',
    visibility: true,
    content: product.attributes?.description ?? null,
    ...(qty === undefined ? {} : { stock: Math.trunc(qty), salable_quantity: Math.trunc(qty) }),
    updated_at: product.updatedAt || null,
    mageos_synced_at: syncedAt,
  }
}

export interface FlatCategory {
  category: NormalizedCategory
  parentUid: string | null
}

/** The tree, parents before children. */
export function flattenCategories(tree: NormalizedCategory[], parentUid: string | null = null): FlatCategory[] {
  return tree.flatMap((category) => [{ category, parentUid }, ...flattenCategories(category.children ?? [], category.id)])
}

/** categories: matched on uid (the store's category uid, which departments pages already use). */
export function categoryRow({ category, parentUid }: FlatCategory, syncedAt: string) {
  return {
    uid: category.id,
    name: category.name,
    sort: category.position,
    mageos_path: category.path,
    mageos_parent_uid: parentUid,
    mageos_level: category.level,
    mageos_synced_at: syncedAt,
  }
}

const int = (value: unknown) => (value === null || value === undefined || value === '' ? null : Math.trunc(Number(value)) || 0)

/**
 * orders: matched on entity_id. Money in cents, like the app's own orders;
 * buyer_id stays empty — a customer's order list already reads store orders
 * live (layers/commerce/server/utils/orders.ts), so a mirrored row would
 * show twice.
 */
export function orderRow(order: Record<string, any>, syncedAt: string) {
  const app = toAdminOrder(order)
  return {
    entity_id: int(order.entity_id),
    increment_id: order.increment_id ?? null,
    status: order.status ?? null,
    state: order.state ?? null,
    customer_id: int(order.customer_id),
    customer_email: order.customer_email ?? null,
    customer_firstname: order.customer_firstname ?? null,
    customer_lastname: order.customer_lastname ?? null,
    customer_is_guest: int(order.customer_is_guest),
    customer_group_id: int(order.customer_group_id),
    order_currency_code: order.order_currency_code ?? null,
    base_currency_code: order.base_currency_code ?? null,
    store_name: order.store_name ?? null,
    coupon_code: order.coupon_code ?? null,
    ext_order_id: order.ext_order_id ?? null,
    is_virtual: int(order.is_virtual),
    total_qty_ordered: int(order.total_qty_ordered),
    total_item_count: int(order.total_item_count),
    grand_total: cents(order.grand_total),
    subtotal: cents(order.subtotal),
    tax_amount: cents(order.tax_amount),
    shipping_amount: cents(order.shipping_amount),
    discount_amount: cents(order.discount_amount),
    total_invoiced: cents(order.total_invoiced),
    total_paid: cents(order.total_paid),
    total_refunded: cents(order.total_refunded),
    total_due: cents(order.total_due),
    payment_status: app.payment_status,
    fulfillment_status: app.fulfillment_status,
    payment_provider: order.payment?.method ?? null,
    line_items_snapshot: app.line_items_snapshot,
    date_created: magentoDate(order.created_at),
    date_updated: magentoDate(order.updated_at),
    mageos_synced_at: syncedAt,
  }
}

/** customers (created by the sync): keyed by the store's customer id. */
export function customerRow(customer: Record<string, any>, userId: string | null, syncedAt: string) {
  return {
    id: int(customer.id),
    email: customer.email ?? null,
    firstname: customer.firstname ?? null,
    lastname: customer.lastname ?? null,
    group_id: int(customer.group_id),
    website_id: int(customer.website_id),
    created_at: magentoDate(customer.created_at),
    updated_at: magentoDate(customer.updated_at),
    user_id: userId,
    mageos_synced_at: syncedAt,
  }
}

/** An ISO timestamp as the store's searchCriteria value ("YYYY-MM-DD HH:MM:SS", UTC). */
export const storeTime = (iso: string) => new Date(iso).toISOString().replace('T', ' ').slice(0, 19)
