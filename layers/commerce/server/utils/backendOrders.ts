import { eq } from 'drizzle-orm'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'
import { centsToDollars } from './currency'
import { backendCustomerId, parseProductRef } from './productRef'
import type { PaidCheckout } from './paidCheckout'

/**
 * Records the lines of a paid checkout that belong to another commerce
 * backend (`magento:<sku>`, see productRef.ts) in that backend — one order
 * per backend, under the buyer's own customer account there, through its
 * placePaidOrder(). For Magento that's a real order Webkul credits the
 * seller for, and what the integrations module checks before a paid
 * integration installs.
 *
 * Idempotent on the payment id (the backend dedupes on it), so retries are
 * safe. Throws when a line can't be recorded, so the webhook retries;
 * checkoutCart.ts already refused carts that can't be (no backend support,
 * buyer not linked).
 */
export async function placeBackendOrders(paid: PaidCheckout): Promise<void> {
  const byBackend = new Map<string, { backend: NonNullable<ReturnType<typeof parseProductRef>> & { kind: 'backend' }, items: { key: string, qty: number }[], cents: number }>()
  for (const line of paid.lines) {
    if (!line.ref) continue
    const parsed = parseProductRef(line.ref)
    if (parsed === null) throw new Error(`Paid line "${line.ref}" belongs to a commerce backend that isn't installed`)
    if (parsed.kind !== 'backend') continue
    const group = byBackend.get(parsed.backend.id) ?? { backend: parsed, items: [], cents: 0 }
    group.items.push({ key: parsed.key, qty: line.quantity })
    group.cents += line.totalCents
    byBackend.set(parsed.backend.id, group)
  }
  if (!byBackend.size) return

  const [buyer] = paid.buyerId
    ? await db.select({ magentoCustomerId: users.magentoCustomerId }).from(users).where(eq(users.id, paid.buyerId)).limit(1)
    : []
  const address = paid.address
  const [firstname, ...lastname] = (paid.name ?? '').trim().split(/\s+/)

  for (const [backendId, group] of byBackend) {
    const placePaidOrder = group.backend.backend.placePaidOrder
    const customerId = backendCustomerId(backendId, buyer)
    if (typeof placePaidOrder !== 'function' || !customerId) {
      throw new Error(`Can't record the ${backendId} lines of payment ${paid.paymentId}: ${customerId ? 'backend has no placePaidOrder' : 'buyer has no customer account there'}`)
    }
    const order = await placePaidOrder({
      // One order per backend per payment.
      reference: byBackend.size > 1 ? `${paid.paymentId}:${backendId}` : paid.paymentId,
      customerId,
      items: group.items,
      // Its lines plus the tax it quoted on them before payment (checkoutTax.ts).
      amountPaid: centsToDollars(group.cents + (paid.backendTaxCents?.[backendId] ?? 0)),
      currency: paid.currency,
      ...(address ? {
        billingAddress: {
          firstname: firstname || undefined,
          lastname: lastname.join(' ') || firstname || undefined,
          street: [address.line1, address.line2].filter((l): l is string => !!l),
          city: address.city ?? undefined,
          region_code: address.state ?? undefined,
          postcode: address.postcode ?? undefined,
          country_id: address.country ?? undefined,
          telephone: paid.phone ?? undefined,
        },
      } : {}),
    })
    console.info(`[checkout] ${backendId} order ${order.number} ${order.created ? 'placed' : 'already placed'} for ${paid.paymentId}`)
  }
}
