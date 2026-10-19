/**
 * Turns Stripe checkout payments and refunds into licensing commerce
 * events. Scope (first rollout): paid integrations — lines whose product
 * key is `<backend>:<sku>` for a SKU an installable integration names in
 * its manifest (meeovi-integrations registry).
 *
 * The purchase id is `stripe:<payment intent>`: one license per paid
 * integration line (the offer tells lines apart), and a full refund of the
 * payment revokes them all. Partial refunds change nothing (contract v1.0).
 */
import type Stripe from 'stripe'
import { useRuntimeConfig } from 'nitropack/runtime'
import { stripe } from '../utils/stripe'
import { centsToDollars } from '../utils/currency'
import { parseProductRef } from '../utils/productRef'
import { ensureIntegrationOffer, useLicensing } from '.'

const purchaseIdFor = (paymentIntentId: string) => `stripe:${paymentIntentId}`

/** SKU → integration slug, for integrations sold through the store. */
function integrationSkus(): Map<string, string> {
  const registry = (useRuntimeConfig() as unknown as { meeoviIntegrations?: { registry?: Array<{ sku: string | null, slug: string }> } })
    .meeoviIntegrations?.registry ?? []
  return new Map(registry.filter((p) => p.sku).map((p) => [p.sku!, p.slug]))
}

/**
 * Issues licenses for the paid integration lines of a checkout (on
 * checkout.session.completed with payment_status paid, and
 * async_payment_succeeded). Idempotent; throws so Stripe retries.
 */
export async function issueLicensesForCheckout(session: Stripe.Checkout.Session, paymentIntentId: string): Promise<void> {
  const integrations = integrationSkus()
  if (!integrations.size) return
  const buyerId = session.metadata?.buyer_id
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { expand: ['data.price.product'], limit: 100 })
  for (const line of lineItems.data) {
    const product = line.price?.product
    const productKey = product && typeof product === 'object' && !('deleted' in product && product.deleted)
      ? (product as Stripe.Product).metadata?.internal_product_id
      : undefined
    const ref = productKey ? parseProductRef(productKey) : null
    if (!productKey || ref?.kind !== 'backend') continue
    const pluginId = integrations.get(ref.key)
    if (!pluginId) continue
    if (!buyerId) throw new Error(`Paid integration ${productKey} in ${paymentIntentId} has no buyer to license`)
    const quantity = line.quantity || 1
    const offer = await ensureIntegrationOffer({
      productKey,
      title: (product as Stripe.Product).name || pluginId,
      price: centsToDollars(Math.round((line.amount_total ?? 0) / quantity)),
      pluginId,
    })
    await useLicensing().commerceEvents.handle({
      event: 'purchase.completed',
      purchaseId: purchaseIdFor(paymentIntentId),
      userId: buyerId,
      productId: productKey,
      licenseId: offer.id,
    })
  }
}

/** A full refund of a payment revokes the licenses it bought. */
export async function revokeLicensesForRefund(charge: Stripe.Charge): Promise<void> {
  const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
  if (!paymentIntentId) return
  const fullyRefunded = (charge.amount_refunded ?? 0) >= (charge.amount ?? 0)
  if (!fullyRefunded) return
  await useLicensing().commerceEvents.handle({ event: 'purchase.refunded', purchaseId: purchaseIdFor(paymentIntentId) })
}
