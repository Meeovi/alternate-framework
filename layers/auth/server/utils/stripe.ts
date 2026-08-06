import Stripe from "stripe";

export const stripeClient = new Stripe(process.env.NUXT_STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia", // Latest API version as of Stripe SDK v22.0.0
})
