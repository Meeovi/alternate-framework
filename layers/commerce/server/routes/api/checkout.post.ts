import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { requireAuth } from '#auth/server/utils/sessions'

// Unused scaffolding, copied from the Polar Nuxt-adapter docs and never
// wired to any frontend caller (grepped, none found) — note `returnUrl`
// below is still the docs' literal placeholder domain, unfixed because
// nothing reaches this route. See checkout.get.ts for more context on why
// this whole Polar checkout surface is disconnected from the app's real
// (PayPal) payments.
// Still reachable with the live Polar token, so it's signed-in only.
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const runtimeConfig = useRuntimeConfig() as any
  const siteUrl = ((runtimeConfig.public as any)?.siteUrl as string | undefined) || '/'
  const polarAccessToken = runtimeConfig.polarAccessToken as string
  const polarCheckoutSuccessUrl = (runtimeConfig.polarCheckoutSuccessUrl || '/') as string
  const polarServer = (runtimeConfig.polarServer || 'sandbox') as 'sandbox' | 'production'

  const checkoutHandler = Checkout({
    accessToken: polarAccessToken,
    successUrl: polarCheckoutSuccessUrl,
    returnUrl: siteUrl, // renders a back-button in the Checkout
    server: polarServer,
    theme: 'dark', // Enforces the theme - System-preferred theme will be set if left omitted
  })

  return checkoutHandler(event)
})