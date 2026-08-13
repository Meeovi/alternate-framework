import { stripe } from '../../utils/stripe'
import { requireAuth } from '#auth/server/utils/sessions'

// The subscription billing plugin actually registered on the betterAuth
// instance is @better-auth/stripe (layers/auth/shared/utils/plugins.ts),
// not Polar — Polar's checkout()/portal() better-auth sub-plugins
// (setupPolar() in ../../utils/polar.ts) are never installed, and nothing
// in this app's real purchase flow ever creates a Polar customer or
// subscription. This route previously redirected to a Polar customer
// portal that had no relationship to the Stripe subscription a real user
// actually holds — repointed at the real Stripe billing portal instead.
export default defineEventHandler(async (event) => {
  // Customer ID is derived from the authenticated session only — it must
  // never be trusted from a query parameter, which would let anyone view
  // another customer's billing portal by guessing an id or email.
  const user = await requireAuth(event)

  if (!user.stripeCustomerId) {
    throw createError({ statusCode: 404, statusMessage: 'No billing account found for this user.' })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: process.env.NUXT_PUBLIC_SITE_URL,
  })

  return sendRedirect(event, portalSession.url)
})