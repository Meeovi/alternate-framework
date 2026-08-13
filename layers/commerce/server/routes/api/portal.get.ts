import { defineEventHandler, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { requireAuth } from '#auth/server/utils/sessions'

// Unused scaffolding — no frontend caller (grepped, none found), and
// user.polarCustomerId is never populated by any real flow in this app
// (nothing calls ensurePolarCustomer outside server/api/payment/polar/
// polar.ts, which is itself unreached). The route the app actually uses
// for billing management is server/routes/api/customer-portal.get.ts,
// which is Stripe-based — that's where the real subscription plugin
// (@better-auth/stripe) lives.
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  if (!user.polarCustomerId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No billing account found for this user',
    })
  }

  const runtimeConfig = useRuntimeConfig() as any
  const polarAccessToken = runtimeConfig.polarAccessToken as string
  const polarServer = (runtimeConfig.polarServer || 'sandbox') as 'sandbox' | 'production'

  const customerPortalHandler = CustomerPortal({
    accessToken: polarAccessToken,
    returnUrl: `${process.env.NUXT_PUBLIC_SITE_URL}`, // An optional URL which renders a back-button in the Customer Portal
    server: polarServer,
    getCustomerId: () => Promise.resolve(user.polarCustomerId as string),
  })

  return customerPortalHandler(event)
})