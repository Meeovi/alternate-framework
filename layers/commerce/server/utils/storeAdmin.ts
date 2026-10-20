import { createError } from 'h3'
import { listCommerceBackendAdapters, type BackendAdminOrder, type CommerceBackendAdapter } from 'alternate-sdk'

/**
 * /workspace store admin: the installed commerce backends that can look up
 * any order and record refunds (adapter-magento with its Integration).
 */
export type RefundBackend = CommerceBackendAdapter & Required<Pick<CommerceBackendAdapter, 'adminOrder' | 'orderByReference' | 'refundOrder'>>

export function refundBackends(): RefundBackend[] {
  return listCommerceBackendAdapters().filter((a): a is RefundBackend =>
    typeof a.adminOrder === 'function' && typeof a.orderByReference === 'function' && typeof a.refundOrder === 'function')
}

export function refundBackend(id: string): RefundBackend {
  const backend = refundBackends().find((b) => b.id === id)
  if (!backend) throw createError({ statusCode: 404, statusMessage: `No store "${id}" that can refund orders` })
  return backend
}

/** An order by backend order id, order number or payment reference. */
export async function findAdminOrder(backend: RefundBackend, lookup: { id?: string, number?: string, reference?: string }): Promise<BackendAdminOrder | null> {
  if (lookup.id) return backend.adminOrder(lookup.id)
  if (lookup.reference) return backend.orderByReference(lookup.reference)
  if (lookup.number) {
    const rows = await backend.request({ method: 'GET', collection: 'orders' }) as Array<{ id: unknown, number: unknown }>
    const row = (Array.isArray(rows) ? rows : []).find((r) => String(r.number) === lookup.number)
    return row ? backend.adminOrder(String(row.id)) : null
  }
  return null
}

/** Store errors (with `status`) as h3 errors with Magento's message. */
export function storeError(error: unknown, action: string): never {
  const status = (error as { status?: number }).status
  // The store refusing the app's integration isn't the admin's session.
  if (status === 401 || status === 403) {
    throw createError({ statusCode: 502, statusMessage: `Couldn't ${action}: the store hasn't given the app's integration permission for this (see adapter-magento's README, "Store admin")` })
  }
  throw createError({
    statusCode: status && status < 500 ? status : 502,
    statusMessage: `Couldn't ${action}: ${String((error as Error)?.message ?? error).replace(/^Magento [A-Z]+ \S+ failed \(\d+\): /, '').slice(0, 300)}`,
  })
}
