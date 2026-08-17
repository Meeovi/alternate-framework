import Stripe from 'stripe'

// Single point of truth for the Stripe server client.
//
// - API version is pinned explicitly (per stripe-best-practices skill) so every
//   endpoint uses the same contract regardless of the installed SDK default.
// - The secret key is read from NUXT_STRIPE_SECRET_KEY (sk_ or rk_ restricted
//   key) consistently across all commerce endpoints. Never use a different env
//   name here, which would cause silent auth failures in one handler but not
//   another.
const apiVersion = '2026-06-24.dahlia' as Stripe.LatestApiVersion

let client: Stripe | null = null

// Constructing Stripe() throws synchronously when the key is missing, and
// every server/api/**/stripe/* route (plus the connect/* routes) imports
// `stripe` at module scope — a top-level throw here would fail to import in
// any Nitro bundling mode that evaluates route modules eagerly, taking down
// far more than just Stripe. Lazily initializing means the missing-key
// error only surfaces inside a route handler's own try/catch, the first
// time Stripe functionality is actually used.
function getClient(): Stripe {
  if (client) return client
  const secretKey = process.env.NUXT_STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('NUXT_STRIPE_SECRET_KEY is required to initialize the Stripe client')
  }
  client = new Stripe(secretKey, { apiVersion })
  return client
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver)
  },
})
