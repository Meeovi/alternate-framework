import type { NuxtApp } from '#app'

/**
 * `getCachedData` for useAsyncData/useFetch in lazily hydrated components
 * (`defineLazyHydrationComponent`, `hydrate-on-*`). Nuxt only reuses the
 * server's payload while the page is hydrating; a component that hydrates
 * later (e.g. when scrolled into view) would refetch in the browser instead,
 * discarding what the server rendered. This reuses the payload on the
 * initial load; refresh() and watch-triggered reloads still fetch.
 */
export function reuseServerData(key: string, nuxtApp: NuxtApp, context: { cause: string }) {
  if (context.cause !== 'initial') return undefined
  // `in`, not `??`: a server result of null is still the server's result —
  // refetching it would hydrate against different data (a mismatch).
  if (key in nuxtApp.payload.data) return nuxtApp.payload.data[key]
  return nuxtApp.static.data[key]
}
