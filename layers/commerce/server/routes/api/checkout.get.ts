import { getPolarClient } from '../../utils/polar'
import { requireAuth } from '#auth/server/utils/sessions'

// Unused scaffolding: this Polar checkout route has no caller anywhere in
// the app (grepped, none found). The real subscription-billing plugin
// registered on the betterAuth instance is @better-auth/stripe (layers/
// auth/shared/utils/plugins.ts), not Polar. See server/routes/api/
// customer-portal.get.ts for the Stripe-based portal this app actually
// uses. Kept rather than deleted since it's not broken, just disconnected
// — remove if Polar is confirmed permanently out of scope for this app.
// Still reachable with the live Polar token: signed-in only, and the
// checkout is always for the account's own email (never one from the URL).
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  if (typeof query.products !== 'string' || !/^[\w-]{1,64}$/.test(query.products)) {
    throw createError({ statusCode: 400, statusMessage: 'A product id is required' })
  }
  const polar = getPolarClient()
  const config = useRuntimeConfig()
  const successUrl = config.polarSuccessUrl
  const checkout = await polar.checkouts.create({
    products: [query.products as string],
    successUrl: successUrl as string,
    customerEmail: user.email,
  })
  return sendRedirect(event, checkout.url)
})