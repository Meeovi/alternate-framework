import type { H3Event } from 'h3'
import type { MarkupRule } from '../../runtime/types'
import { getProvider, type Credentials, type Recipient, type SupplierProvider } from '../providers'
import { SKU_PREFIX, dropshipConfig, magento, openCredentials, sealCredentials, skuFor } from './context'
import { fetchImage } from './images'
import { priceFrom, store, type ConnectionRow, type OrderRow } from './store'

/**
 * The work: importing products into Magento, keeping stock/price current,
 * forwarding paid Magento orders to the supplier, and bringing tracking
 * back as Magento shipments. Called from the API (import) and the
 * scheduler plugin (everything else).
 */

const errorText = (error: unknown) => String((error as Error)?.message || error).slice(0, 500)
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Decrypted credentials, renewed (and re-saved) when the provider says so. */
export async function credentialsFor(connection: ConnectionRow, event?: H3Event): Promise<{ provider: SupplierProvider, credentials: Credentials }> {
  const provider = getProvider(connection.provider)
  if (!provider) throw new Error(`Unknown supplier ${connection.provider}`)
  let credentials = openCredentials(connection.credentials, event)
  const renewed = await provider.refresh?.(credentials)
  if (renewed) {
    credentials = renewed
    await store(event).connections.update(connection.id, { credentials: sealCredentials(renewed, event) })
  }
  return { provider, credentials }
}

// ---------------------------------------------------------------------------
// Import

export interface ImportResult { productId: string, created: number, updated: number, skipped: string[], errors: string[] }

export async function importProduct(connection: ConnectionRow, productId: string, markup: MarkupRule, event?: H3Event): Promise<ImportResult> {
  const { provider, credentials } = await credentialsFor(connection, event)
  const { sync, credentials: mage } = magento(event)
  const db = store(event)
  const pod = dropshipConfig(event).printOnDemandQty
  const product = await provider.getProduct(credentials, productId)
  const result: ImportResult = { productId, created: 0, updated: 0, skipped: [], errors: [] }

  // Download images once per product; the first goes on every variant as main.
  const images = []
  for (const url of product.images.slice(0, 5)) {
    const image = await fetchImage(url).catch(() => null)
    if (image) images.push(image)
  }

  for (const variant of product.variants) {
    const price = variant.retailPrice ?? (variant.cost !== null ? priceFrom(variant.cost, markup) : null)
    if (price === null || price <= 0) {
      result.skipped.push(`${variant.name}: no price`)
      continue
    }
    const sku = skuFor(provider.id, connection.magento_customer_id, variant.id)
    const qty = variant.stock ?? pod
    const name = product.variants.length > 1 && variant.name !== product.name ? variant.name : product.name
    try {
      await sync.upsertProduct(mage, {
        customerId: connection.magento_customer_id,
        sku,
        name: name.slice(0, 255),
        price,
        description: product.description,
        qty,
        weight: variant.weightKg,
        enabled: qty > 0,
      })
      const existing = await db.products.bySku(sku)
      const fields = {
        name, cost: variant.cost, price, markup: variant.retailPrice === null ? markup : null, stock: variant.stock,
        status: qty > 0 ? 'active' as const : 'out_of_stock' as const, last_error: null, last_synced: new Date().toISOString(),
      }
      if (existing) {
        await db.products.update(existing.id, fields)
        result.updated++
      } else {
        await db.products.create({
          ...fields, connection_id: connection.id, user_id: connection.user_id, magento_customer_id: connection.magento_customer_id,
          provider: provider.id, supplier_product_id: product.id, supplier_variant_id: variant.id, sku,
        })
        result.created++
        for (const [index, image] of images.entries()) {
          await sync.addImage(mage, {
            customerId: connection.magento_customer_id, sku, base64Content: image.base64, mimeType: image.mimeType,
            fileName: image.fileName, isMain: index === 0,
          }).catch((error: unknown) => result.errors.push(`${variant.name}: image ${index + 1} — ${errorText(error)}`))
        }
      }
    } catch (error) {
      result.errors.push(`${variant.name}: ${errorText(error)}`)
    }
  }
  return result
}

// ---------------------------------------------------------------------------
// Stock & price

export async function syncStock(connection: ConnectionRow): Promise<void> {
  const db = store()
  const { sync, credentials: mage } = magento()
  const { provider, credentials } = await credentialsFor(connection)
  const pod = dropshipConfig().printOnDemandQty
  const products = await db.products.forConnection(connection.id)
  const byProduct = new Map<string, typeof products>()
  for (const p of products) byProduct.set(p.supplier_product_id, [...(byProduct.get(p.supplier_product_id) ?? []), p])

  for (const [productId, variants] of byProduct) {
    let stock: Record<string, number | null>
    try {
      stock = await provider.getStock(credentials, productId)
    } catch (error) {
      for (const v of variants) await db.products.update(v.id, { status: 'error', last_error: errorText(error) })
      continue
    }
    for (const v of variants) {
      // A variant the supplier no longer lists is treated as sold out.
      const qty = v.supplier_variant_id in stock ? (stock[v.supplier_variant_id] ?? pod) : 0
      try {
        await sync.updateStock(mage, { customerId: connection.magento_customer_id, sku: v.sku, qty, enabled: qty > 0 })
        await db.products.update(v.id, {
          stock: stock[v.supplier_variant_id] ?? null, status: qty > 0 ? 'active' : 'out_of_stock',
          last_error: null, last_synced: new Date().toISOString(),
        })
      } catch (error) {
        await db.products.update(v.id, { status: 'error', last_error: errorText(error) })
      }
    }
    if (connection.provider === 'cj') await pause(1100)
  }
}

// ---------------------------------------------------------------------------
// Orders

/** Magento order address → supplier recipient. */
function recipientOf(order: any): Recipient | null {
  const address = order?.extension_attributes?.shipping_assignments?.[0]?.shipping?.address
  if (!address?.street?.[0] || !address.city || !address.country_id) return null
  return {
    name: `${address.firstname ?? ''} ${address.lastname ?? ''}`.trim(),
    address1: address.street[0],
    address2: address.street.slice(1).join(', ') || undefined,
    city: address.city,
    region: address.region || undefined,
    regionCode: address.region_code || undefined,
    countryCode: address.country_id,
    postcode: address.postcode || undefined,
    phone: address.telephone || undefined,
    email: order.customer_email || undefined,
  }
}

/** Paid Magento orders with this seller's dropship SKUs → supplier orders. */
export async function forwardOrders(connections: ConnectionRow[]): Promise<void> {
  if (!connections.length) return
  const db = store()
  const { sync, credentials: mage } = magento()
  const since = new Date(Date.now() - 3 * 86400_000).toISOString().replace('T', ' ').slice(0, 19)
  const { items: orders } = await sync.listOrders(mage, [
    { field: 'status', value: 'processing' },
    { field: 'updated_at', value: since, condition: 'gteq' },
  ], 100)

  for (const connection of connections) {
    const prefix = `DS-${connection.provider.toUpperCase()}-${connection.magento_customer_id}-`
    for (const order of orders ?? []) {
      const items = (order.items ?? []).filter((i: any) => !i.parent_item_id && String(i.sku).startsWith(prefix))
      if (!items.length) continue
      const existing = await db.orders.find(connection.id, Number(order.entity_id))
      if (existing && (existing.status !== 'error' || existing.attempts >= 3)) continue

      const record: Partial<OrderRow> = {
        connection_id: connection.id, user_id: connection.user_id, provider: connection.provider,
        magento_order_id: Number(order.entity_id), magento_increment_id: String(order.increment_id),
        magento_items: items.map((i: any) => ({ item_id: Number(i.item_id), qty: Number(i.qty_ordered) })), attempts: (existing?.attempts ?? 0) + 1,
      }
      try {
        const recipient = recipientOf(order)
        if (!recipient) throw new Error('The order has no shipping address')
        const lines = []
        for (const item of items) {
          const product = await db.products.bySku(String(item.sku))
          if (!product || product.connection_id !== connection.id) throw new Error(`Unknown dropship SKU ${item.sku}`)
          lines.push({ variantId: product.supplier_variant_id, quantity: Number(item.qty_ordered) })
        }
        const { provider, credentials } = await credentialsFor(connection)
        const created = await provider.createOrder(credentials, {
          externalId: `${order.increment_id}-${connection.magento_customer_id}`,
          recipient, items: lines, confirm: Boolean(connection.auto_confirm_orders),
        })
        Object.assign(record, { supplier_order_id: created.supplierOrderId, status: created.status, last_error: null })
      } catch (error) {
        Object.assign(record, { status: 'error', last_error: errorText(error) })
      }
      if (existing) await db.orders.update(existing.id, record)
      else await db.orders.create(record)
    }
  }
}

/** Supplier tracking → Magento shipment (only the seller's items in the order). */
export async function syncTracking(): Promise<void> {
  const db = store()
  const { sync, credentials: mage } = magento()
  const pending = await db.orders.awaitingTracking()
  const connections = new Map<string, ConnectionRow | null>()

  for (const order of pending) {
    if (!order.supplier_order_id) continue
    if (!connections.has(order.connection_id)) connections.set(order.connection_id, await db.connections.get(order.connection_id))
    const connection = connections.get(order.connection_id)
    if (!connection || connection.status === 'disconnected') continue
    try {
      const { provider, credentials } = await credentialsFor(connection)
      const [shipment] = await provider.getShipments(credentials, order.supplier_order_id)
      if (!shipment) continue
      await sync.shipOrder(mage, order.magento_order_id, {
        items: order.magento_items.map((i) => ({ order_item_id: i.item_id, qty: i.qty })),
        tracks: [{ track_number: shipment.trackingNumber, title: shipment.carrier, carrier_code: 'custom' }],
        notify: true,
      })
      await db.orders.update(order.id, {
        status: 'shipped', tracking_number: shipment.trackingNumber, tracking_url: shipment.trackingUrl, carrier: shipment.carrier, last_error: null,
      })
    } catch (error) {
      await db.orders.update(order.id, { last_error: errorText(error) })
    }
    if (connection.provider === 'cj') await pause(1100)
  }
}

export { SKU_PREFIX }
