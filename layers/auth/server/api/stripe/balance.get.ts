import { defineEventHandler, createError } from 'h3'
import { stripeClient } from '../../utils/stripe'
import { requireOrgStripeManager } from '../../utils/stripeConnect'

export default defineEventHandler(async (event) => {
  // Signed in (401), active org (400), and its owner/admin (403).
  const { stripeAccountId } = await requireOrgStripeManager(event)

  if (!stripeAccountId) {
    return { balance: null, connected: false }
  }

  // stripeAccount belongs in the second argument (RequestOptions), not the
  // first (BalanceRetrieveParams, which only accepts `expand`) — Stripe
  // rejected this as "unknown parameter: stripeAccount" on every call.
  const balance = await stripeClient.balance.retrieve({}, {
    stripeAccount: stripeAccountId
  })

  return { balance, connected: true }
})
