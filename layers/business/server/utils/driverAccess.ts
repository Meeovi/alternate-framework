/**
 * Access-control manifest for the `POST /api/business/driver` RPC proxy —
 * same rationale as `layers/commerce/server/utils/driverAccess.ts` and
 * `layers/social/server/utils/driverAccess.ts`: the proxy forwards a
 * method name from an untrusted request body straight to the server-side
 * business driver, so every reachable method has to be listed explicitly
 * (fail closed).
 *
 * Unlike commerce/social there is no `public` tier here — every method
 * returns data scoped to the signed-in seller's own business, so every
 * method requires a session. `driver.post.ts` also injects the session
 * user's id as `sellerId` on every call, so even a caller who guesses a
 * valid method name can only ever read their own data.
 */
export const BUSINESS_DRIVER_AUTHED_METHODS: ReadonlySet<string> = new Set([
  'products.list',
  'orders.list',
  'invoices.list',
  'reviews.list',
  'shipments.list',
  'spaces.list',
  'attributes.list',
  'integrations.list',
  'shop.get',
  'shop.update',
  'lowStock.list',
  'transactions.list',
  'payouts.list',
  'payouts.request',
  'coupons.list',
  'featuredProducts.list',
  'announcements.list',
  'getStats'
])

export type BusinessDriverAccess = 'authed' | 'denied'

export function classifyBusinessDriverMethod(method: string): BusinessDriverAccess {
  if (BUSINESS_DRIVER_AUTHED_METHODS.has(method)) return 'authed'
  return 'denied'
}
