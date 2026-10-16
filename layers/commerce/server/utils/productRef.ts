import { CommerceBackendRegistry } from 'alternate-sdk'
import type { CommerceBackendAdapter } from 'alternate-sdk'

/**
 * Product keys across commerce backends. Directus products keep their plain
 * id; a product from another commerce backend is keyed
 * `<backend>:<key>` — e.g. `magento:ACME-KANBAN` — in cart lines, checkout
 * line metadata and /product/<ref>. The backend (registered in
 * CommerceBackendRegistry by its adapter, e.g. adapter-magento) owns the
 * product, its price and its orders.
 */

const REF_RE = /^([a-z][a-z0-9-]{1,31}):(.{1,128})$/

export type ProductRef =
  | { kind: 'directus', id: string }
  | { kind: 'backend', backend: CommerceBackendAdapter, key: string }

/** null: a backend-prefixed key whose backend isn't installed here. */
export function parseProductRef(ref: string): ProductRef | null {
  const match = REF_RE.exec(ref)
  if (!match || match[1] === 'directus') return { kind: 'directus', id: match ? match[2]! : ref }
  const backend = CommerceBackendRegistry.get(match[1]!)
  return backend?.isEnabled() ? { kind: 'backend', backend, key: match[2]! } : null
}

/**
 * The buyer's customer id in a commerce backend. better-auth keeps the
 * Magento link on the user (users.magento_customer_id, set by
 * adapter-magento's CommerceCustomerLinkRegistry hook at signup).
 */
export function backendCustomerId(backendId: string, user: Record<string, any> | null | undefined): string | null {
  if (!user) return null
  if (backendId === 'magento') {
    const id = Number(user.magentoCustomerId)
    return Number.isInteger(id) && id > 0 ? String(id) : null
  }
  return null
}
