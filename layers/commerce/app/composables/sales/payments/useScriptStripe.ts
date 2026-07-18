// Local Stripe.js initializer. Always resolve the publishable key from
// runtime config — never hardcode a literal `pk_test_xxx`, which would break
// Checkout/Payment Element in production. The key is injected via
// NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_live_... in prod, pk_test_... in dev).
const config = useRuntimeConfig()
const publishableKey = config.public.stripePublishableKey as string

if (!publishableKey || !publishableKey.startsWith('pk_')) {
  throw new Error('Stripe publishable key missing or invalid')
}

const { proxy } = useScriptStripe() as any

const stripe = await proxy.Stripe(publishableKey)
