// src/index.ts

import { createAuthTransport } from './transport'
import { createAuthAdapter } from './auth'

export const installAuthAdapter = (config: { baseUrl: string; apiKey?: string }) => {
  const transport = createAuthTransport(config)
  const adapter = createAuthAdapter(transport)

  // Attempt to register with @mframework/core if it's available at runtime.
  // Use dynamic import so this package does not statically require @mframework/core
  // and can be used standalone. If core isn't present, caller can register
  // the adapter manually via the returned value.
  import('@mframework/core')
    .then((mod: any) => {
      if (mod && typeof mod.setAuthAdapter === 'function') {
        try {
          mod.setAuthAdapter(adapter)
        } catch (e) {
          // ignore registration errors
        }
      }
    })
    .catch(() => {
      // core not available — no-op
    })

  return adapter
}

// Optional BetterAuth runtime exports

export { auth, Auth } from './betterauth'
export { default as BetterAuthProvider } from './provider'
export { getAuthPlugins } from './plugins'

export * from './types'
export * from './auth'
export * from './utils'
export * from './transport'
export * from './framework'
export * from './registry'
export * from './validation'
export * from './config'

export * from 'better-auth/client/plugins'
export * from '@polar-sh/better-auth'
export * as BetterAuth from 'better-auth'

export { getAuthConfig } from './config'
export { getFrameworkContext } from './framework'
export type { AuthProvider } from './types'
export { registerAuthProvider } from './registry'
export { polarClient } from '@polar-sh/better-auth'
export { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
export { stripeClient } from '@better-auth/stripe/client'
