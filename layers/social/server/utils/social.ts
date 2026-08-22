import type { SocialDriverContract } from 'alternate-sdk/contracts'

let cachedDriver: SocialDriverContract | null = null
let cacheKey: string | null = null

/**
 * Returns the social driver from the server-side gateway.
 *
 * On the server, `nuxtApp.$sdk` is populated by the `alternate-sdk` plugin's
 * `initGateway()` call during the Nuxt plugin lifecycle. This helper gives
 * server API handlers a typed accessor without importing `alternate-sdk`
 * directly.
 *
 * A simple module-level cache is used to avoid re-resolving the driver on
 * every request within the same server context.
 */
export function getSocialDriver(): SocialDriverContract {
  // useNuxtApp isn't a real, resolvable binding in a Nitro server route (no
  // import wires it up, and Nitro doesn't auto-import it here) —
  // referencing it unguarded threw an uncaught ReferenceError on every
  // request. typeof is the one reference form that doesn't throw on a
  // genuinely undeclared identifier, so use that to probe for it safely.
  let driver: SocialDriverContract | undefined
  try {
    const nuxtApp: any = typeof useNuxtApp === 'function' ? useNuxtApp() : undefined
    const sdk = nuxtApp?.$sdk as Record<string, unknown> | undefined
    driver = sdk?.social as SocialDriverContract | undefined
  } catch {
    // useNuxtApp not available in this server context
  }

  if (driver) {
    return driver
  }

  // Fallback: the social adapter may be set as the default driver
  // via SocialDriverRegistry in alternate-sdk.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('alternate-sdk')
    if (mod.SocialDriverRegistry) {
      const defaultDriver = mod.SocialDriverRegistry.getDefaultDriver?.()
      if (defaultDriver) return defaultDriver as SocialDriverContract
    }
  } catch {
    // alternate-sdk not available at runtime in this context
  }

  return {} as SocialDriverContract
}
