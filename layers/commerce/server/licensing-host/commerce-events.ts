/**
 * Turns checkout payments and refunds into licensing commerce events.
 * Scope (first rollout): paid integrations — lines whose product key is
 * `<backend>:<sku>` for a SKU an installable integration names in its
 * manifest (meeovi-integrations registry).
 *
 * The purchase id is `<provider>:<payment id>` (e.g. `paypal:<capture>`):
 * one license per paid integration line
 * (the offer tells lines apart), and a full refund of the payment revokes
 * them all. Partial refunds change nothing (contract v1.0).
 */
import { useRuntimeConfig } from 'nitropack/runtime'
import { centsToDollars } from '../utils/currency'
import { parseProductRef } from '../utils/productRef'
import type { PaidCheckout } from '../utils/paidCheckout'
import { ensureIntegrationOffer, repository, useLicensing } from '.'

const purchaseIdFor = (provider: string, paymentId: string) => `${provider}:${paymentId}`

/** SKU → integration slug, for integrations sold through the store. */
function integrationSkus(): Map<string, string> {
  const registry = (useRuntimeConfig() as unknown as { meeoviIntegrations?: { registry?: Array<{ sku: string | null, slug: string }> } })
    .meeoviIntegrations?.registry ?? []
  return new Map(registry.filter((p) => p.sku).map((p) => [p.sku!, p.slug]))
}

/**
 * Issues licenses for the paid integration lines of a checkout once its
 * payment has cleared. Idempotent; throws so the webhook retries.
 */
export async function issueLicensesForPayment(paid: PaidCheckout): Promise<void> {
  const integrations = integrationSkus()
  if (!integrations.size) return
  const purchaseId = purchaseIdFor(paid.provider, paid.paymentId)
  for (const line of paid.lines) {
    const ref = line.ref ? parseProductRef(line.ref) : null
    if (!line.ref || ref?.kind !== 'backend') continue
    const pluginId = integrations.get(ref.key)
    if (!pluginId) continue
    if (!paid.buyerId) throw new Error(`Paid integration ${line.ref} in ${paid.paymentId} has no buyer to license`)
    const offer = await ensureIntegrationOffer({
      productKey: line.ref,
      title: line.name || pluginId,
      price: centsToDollars(line.unitCents),
      pluginId,
    })
    await useLicensing().commerceEvents.handle({
      event: 'purchase.completed',
      purchaseId,
      userId: paid.buyerId,
      productId: line.ref,
      licenseId: offer.id,
    })
    const [license] = await repository().findUserLicenseByPurchase(purchaseId, offer.id)
    console.info(`[licensing] ${pluginId} license ${license?.id ?? 'MISSING'} (${license?.status ?? '-'}) for ${purchaseId}`)
  }
}

/** A full refund of a payment revokes the licenses it bought. */
export async function revokeLicensesForPayment(provider: string, paymentId: string): Promise<void> {
  await useLicensing().commerceEvents.handle({ event: 'purchase.refunded', purchaseId: purchaseIdFor(provider, paymentId) })
}
