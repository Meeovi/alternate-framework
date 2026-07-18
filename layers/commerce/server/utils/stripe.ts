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

const secretKey = process.env.NUXT_STRIPE_SECRET_KEY

if (!secretKey) {
  throw new Error('NUXT_STRIPE_SECRET_KEY is required to initialize the Stripe client')
}

export const stripe = new Stripe(secretKey, { apiVersion })
