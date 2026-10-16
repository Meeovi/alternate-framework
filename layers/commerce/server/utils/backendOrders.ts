import type Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'
import { stripe } from './stripe'
import { centsToDollars } from './currency'
import { backendCustomerId, parseProductRef } from './productRef'

/**
 * Records the lines of a paid Stripe checkout that belong to another
 * commerce backend (`magento:<sku>`, see productRef.ts) in that backend —
 * one order per backend, under the buyer's own customer account there,
 * through its placePaidOrder(). For Magento that's a real order Webkul
 * credits the seller for, and what the integrations module checks before
 * a paid integration installs.
 *
 * Idempotent on the Stripe payment intent (the backend dedupes on it), so
 * webhook retries are safe. Throws when a line can't be recorded, so the
 * webhook fails and Stripe retries; checkout-session.post.ts already
 * refused carts that can't be (no backend support, buyer not linked).
 */
export async function recordBackendOrders(session: Stripe.Checkout.Session, paymentIntentId: string): Promise<void> {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ['data.price.product'],
    limit: 100,
  })

  const byBackend = new Map<string, { backend: NonNullable<ReturnType<typeof parseProductRef>> & { kind: 'backend' }, items: { key: string, qty: number }[], cents: number }>()
  for (const line of lineItems.data) {
    const product = line.price?.product
    const ref = product && typeof product === 'object' && !('deleted' in product && product.deleted)
      ? (product as Stripe.Product).metadata?.internal_product_id
      : undefined
    if (!ref) continue
    const parsed = parseProductRef(ref)
    if (parsed === null) throw new Error(`Paid line "${ref}" belongs to a commerce backend that isn't installed`)
    if (parsed.kind !== 'backend') continue
    const group = byBackend.get(parsed.backend.id) ?? { backend: parsed, items: [], cents: 0 }
    group.items.push({ key: parsed.key, qty: line.quantity ?? 1 })
    group.cents += line.amount_total ?? 0
    byBackend.set(parsed.backend.id, group)
  }
  if (!byBackend.size) return

  const buyerId = session.metadata?.buyer_id
  const [buyer] = buyerId
    ? await db.select({ magentoCustomerId: users.magentoCustomerId }).from(users).where(eq(users.id, buyerId)).limit(1)
    : []
  const address = session.customer_details?.address
  const [firstname, ...lastname] = (session.customer_details?.name ?? '').trim().split(/\s+/)

  for (const [backendId, group] of byBackend) {
    const placePaidOrder = group.backend.backend.placePaidOrder
    const customerId = backendCustomerId(backendId, buyer)
    if (typeof placePaidOrder !== 'function' || !customerId) {
      throw new Error(`Can't record the ${backendId} lines of payment ${paymentIntentId}: ${customerId ? 'backend has no placePaidOrder' : 'buyer has no customer account there'}`)
    }
    const order = await placePaidOrder({
      // One order per backend per payment.
      reference: byBackend.size > 1 ? `${paymentIntentId}:${backendId}` : paymentIntentId,
      customerId,
      items: group.items,
      amountPaid: centsToDollars(group.cents),
      currency: String(session.currency ?? 'usd'),
      ...(address ? {
        billingAddress: {
          firstname: firstname || undefined,
          lastname: lastname.join(' ') || firstname || undefined,
          street: [address.line1, address.line2].filter((l): l is string => !!l),
          city: address.city ?? undefined,
          region_code: address.state ?? undefined,
          postcode: address.postal_code ?? undefined,
          country_id: address.country ?? undefined,
          telephone: session.customer_details?.phone ?? undefined,
        },
      } : {}),
    })
    console.info(`[webhook] ${backendId} order ${order.number} ${order.created ? 'placed' : 'already placed'} for ${paymentIntentId}`)
  }
}
