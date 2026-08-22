import { getPolarClient } from '../../utils/polar'

// Unused scaffolding: this Polar checkout route has no caller anywhere in
// the app (grepped, none found). The real subscription-billing plugin
// registered on the betterAuth instance is @better-auth/stripe (layers/
// auth/shared/utils/plugins.ts), not Polar. See server/routes/api/
// customer-portal.get.ts for the Stripe-based portal this app actually
// uses. Kept rather than deleted since it's not broken, just disconnected
// — remove if Polar is confirmed permanently out of scope for this app.
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const polar = getPolarClient()
  const config = useRuntimeConfig()
  const successUrl = config.polarSuccessUrl
  const checkout = await polar.checkouts.create({
    products: [query.products as string],
    successUrl: successUrl as string,
    customerEmail: query.customerEmail as string | undefined,
  })
  return sendRedirect(event, checkout.url)
})