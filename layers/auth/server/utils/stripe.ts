import Stripe from "stripe";

let client: Stripe | null = null

// Constructing Stripe() throws synchronously when the key is missing. This
// module is imported at the top of shared/utils/plugins.ts, whose `plugins`
// array (built at module scope, when the shared betterAuth() instance is
// constructed) passes stripeClient straight into the `stripe()` plugin
// config — a top-level throw here would crash construction of the entire
// plugin list, i.e. the whole auth layer, not just Stripe subscriptions.
// Lazily initializing means the missing-key error only surfaces the first
// time something actually calls a method on the client.
function getClient(): Stripe {
  if (client) return client
  const secretKey = process.env.NUXT_STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('NUXT_STRIPE_SECRET_KEY is required to initialize the Stripe client')
  }
  client = new Stripe(secretKey, { apiVersion: "2026-06-24.dahlia" })
  return client
}

export const stripeClient: Stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver)
  },
})
