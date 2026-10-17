import { and, eq, isNull, or } from 'drizzle-orm'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'
import { parseProductRef } from './productRef'

export type ProductSeller = {
  /** What the product page shows after "By". */
  name: string
  /** The seller's member profile (/u/<username>), when they have one here. */
  username: string | null
}

/**
 * The app user linked to a backend's customer id — the inverse of
 * backendCustomerId() (productRef.ts). Visible users only.
 */
async function memberForBackendCustomer(backendId: string, customerId: string) {
  if (backendId !== 'magento' || !/^\d+$/.test(customerId)) return null
  const [member] = await db
    .select({ name: users.name, username: users.username })
    .from(users)
    .where(and(eq(users.magentoCustomerId, Number(customerId)), isNull(users.deletedAt), or(isNull(users.authBanned), eq(users.authBanned, false))))
    .limit(1)
  return member ?? null
}

/**
 * Who sells a commerce-backend product (`<backend>:<key>`): the backend's
 * shop name if the seller set one, else the linked member's name. Null for
 * Directus products, backends without sellers, or products nobody sells.
 */
export async function productSeller(productKey: string): Promise<ProductSeller | null> {
  const ref = parseProductRef(productKey)
  if (!ref || ref.kind !== 'backend' || typeof ref.backend.productSellers !== 'function') return null
  const seller = (await ref.backend.productSellers([ref.key]))[ref.key]
  if (!seller) return null
  const member = await memberForBackendCustomer(ref.backend.id, seller.customerId)
  const name = seller.name || member?.name?.trim() || member?.username || null
  return name ? { name, username: member?.username ?? null } : null
}
