// utils/stripe.ts
import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Returns a Stripe instance (singleton per publishable key)
 * @param {string} publishableKey - Your Stripe publishable key
 * @returns {Promise<Stripe | null>}
 */
export function getStripe(publishableKey: string): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}
