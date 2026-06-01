import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

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