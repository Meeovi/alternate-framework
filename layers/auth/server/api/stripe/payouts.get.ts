import { defineEventHandler, createError } from 'h3'
import { stripeClient } from '../../utils/stripe'
import { requireOrgStripeManager } from '../../utils/stripeConnect'

export default defineEventHandler(async (event) => {
  // Signed in (401), active org (400), and its owner/admin (403).
  const { stripeAccountId } = await requireOrgStripeManager(event)

  if (!stripeAccountId) {
    return { payouts: [], connected: false }
  }

  const payouts = await stripeClient.payouts.list(
    { limit: 20 },
    { stripeAccount: stripeAccountId }
  )

  return { payouts: payouts.data, connected: true }
})
