import type { PolarCheckoutStatus, PolarProductSummary } from '../types'

/**
 * Client helpers for the module's routes. Checkout and the portal are
 * full-page redirects to Polar, so they navigate rather than fetch.
 */
export function usePolarCheckout() {
  const { apiBase } = (useRuntimeConfig().public as Record<string, any>).meeoviPolar ?? { apiBase: '/api/polar' }

  return {
    /** Go to Polar's checkout for one or more products (slugs or ids). */
    checkout: (products: string | string[]) =>
      navigateTo(`${apiBase}/checkout?products=${encodeURIComponent([products].flat().join(','))}`, { external: true }),
    /** Go to Polar's customer portal. */
    portal: () => navigateTo(`${apiBase}/portal`, { external: true }),
    /** The products that can be bought, with prices. */
    products: () => $fetch<PolarProductSummary[]>(`${apiBase}/products`),
    /** A checkout's status, e.g. from `?checkout_id=` on the success page. */
    status: (checkoutId: string) => $fetch<PolarCheckoutStatus>(`${apiBase}/checkout/${encodeURIComponent(checkoutId)}`),
  }
}
