import type { BusinessDriverContract } from 'alternate-sdk/contracts'

/**
 * Client-side proxy to the server-side business/seller driver.
 *
 * Forwards method calls to `POST /api/business/driver` instead of talking
 * to any backend SDK directly — mirrors
 * `layers/social/app/composables/useSocialDriver.ts`. This keeps the
 * seller dashboard pages backend-agnostic: they only depend on HTTP and
 * the `BusinessDriverContract` method names, not on which concrete backend
 * (the bundled mock adapter today, Magento/Webkul or Directus later)
 * actually answers the call.
 */
// BusinessDriverContract nests list operations under products/orders/
// invoices/etc. (e.g. `business.products.list()`, not `business.list()`).
// Building the proxy on a callable target lets each property access chain
// into another proxy that is itself both traversable (`.get`) and
// invocable (`.apply`), so arbitrary nesting depth forwards to the server
// as a dotted method path (e.g. "products.list") without this composable
// needing to special-case which names are nested.
function createBusinessProxy(path: string[], fetcher: typeof $fetch): any {
  return new Proxy(() => {}, {
    get(_target, prop: string) {
      return createBusinessProxy([...path, prop], fetcher)
    },
    apply(_target, _thisArg, args: unknown[]) {
      const method = path.join('.')
      if (!method) return Promise.resolve(undefined)

      return fetcher('/api/business/driver', {
        method: 'POST',
        body: { method, args: args.length > 0 ? args : undefined },
      })
    },
  })
}

export function useBusinessDriver(): BusinessDriverContract {
  // useRequestFetch() forwards the incoming request's cookies during SSR
  // (plain `$fetch` does not) so `requireSeller` on the server route sees
  // the seller's session on the very first render, not only after
  // client-side hydration re-fetches. On the client it's equivalent to
  // `$fetch`. Must be called synchronously here (inside a composable),
  // not deferred into the async proxy handler below.
  const fetcher = useRequestFetch()
  return createBusinessProxy([], fetcher)
}

export default useBusinessDriver
