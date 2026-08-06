import type { SocialDriverContract } from '@mframework/alternate-sdk/contracts/social'

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
  // eslint-disable-next-line no-undef
  const nuxtApp: any = useNuxtApp?.()
  const sdk = nuxtApp?.$sdk as Record<string, unknown> | undefined
  const driver = sdk?.social as SocialDriverContract | undefined

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
