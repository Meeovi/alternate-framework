/**
 * The app's key for a product (cart lines, /product/<key>): a Directus
 * product's id, or `<backend>:<sku>` for one from a commerce backend —
 * adapter-normalized products carry `source` (e.g. adapter-magento's
 * `magento`). Matches server/utils/productRef.ts.
 */
export function productKey(product: Record<string, any> | null | undefined): string {
  if (!product) return ''
  if (typeof product.source === 'string' && product.source !== 'directus' && product.sku) {
    return `${product.source}:${product.sku}`
  }
  return String(product.id ?? product.uid ?? product.product_id ?? '')
}

/** `magento:ACME-KANBAN` → { backend: 'magento', key: 'ACME-KANBAN' }; null for a Directus id. */
export function parseProductKey(key: string): { backend: string, key: string } | null {
  const match = /^([a-z][a-z0-9-]{1,31}):(.{1,128})$/.exec(key)
  return match && match[1] !== 'directus' ? { backend: match[1]!, key: match[2]! } : null
}

/**
 * One key per product wherever it shows (ratings): a store product's
 * `<backend>:<sku>` whether the row came from the backend (`source` + `sku`)
 * or is its Directus mirror (`mageos_sku`; the mirror's own id differs), else
 * the Directus product's id.
 */
export function canonicalProductKey(product: Record<string, any> | null | undefined): string {
  if (!product) return ''
  if (product.mageos_sku) return `magento:${product.mageos_sku}`
  return productKey(product)
}
