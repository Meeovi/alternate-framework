import { defineEventHandler, createError } from 'h3'
import { stripeClient } from '../../utils/stripe'
import { requireOrgStripeManager } from '../../utils/stripeConnect'

export default defineEventHandler(async (event) => {
  // Signed in (401), active org (400), and its owner/admin (403).
  const { stripeAccountId } = await requireOrgStripeManager(event)

  if (!stripeAccountId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No connected Stripe account. Complete onboarding first.'
    })
  }

  // Already connected — create a login link to the Express dashboard
  const loginLink = await stripeClient.accounts.createLoginLink(stripeAccountId)
  return { url: loginLink.url, connected: true }
})
