import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

// Unused scaffolding, copied from the Polar Nuxt-adapter docs and never
// wired to any frontend caller (grepped, none found) — note `returnUrl`
// below is still the docs' literal placeholder domain, unfixed because
// nothing reaches this route. See checkout.get.ts for more context on why
// this whole Polar checkout surface is disconnected from the app's real
// (Stripe-based) subscription billing.
export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig() as any
  const polarAccessToken = runtimeConfig.polarAccessToken as string
  const polarCheckoutSuccessUrl = (runtimeConfig.polarCheckoutSuccessUrl || '/') as string
  const polarServer = (runtimeConfig.polarServer || 'sandbox') as 'sandbox' | 'production'

  const checkoutHandler = Checkout({
    accessToken: polarAccessToken,
    successUrl: polarCheckoutSuccessUrl,
    returnUrl: 'https://myapp.com', // An optional URL which renders a back-button in the Checkout
    server: polarServer,
    theme: 'dark', // Enforces the theme - System-preferred theme will be set if left omitted
  })

  return checkoutHandler(event)
})