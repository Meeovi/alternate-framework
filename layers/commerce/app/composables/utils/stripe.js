// utils/stripe.ts
import { loadStripe } from '@stripe/stripe-js';
let stripePromise = null;
/**
 * Returns a Stripe instance (singleton per publishable key)
 * @param {string} publishableKey - Your Stripe publishable key
 * @returns {Promise<Stripe | null>}
 */
export function getStripe(publishableKey) {
    if (!stripePromise) {
        stripePromise = loadStripe(publishableKey);
    }
    return stripePromise;
}
