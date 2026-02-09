// src/index.ts

import { createAuthTransport } from './transport.js'
import { createAuthAdapter } from './auth.js'

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
export { auth, Auth } from './betterauth.js'
export { default as BetterAuthProvider } from './provider.js'
export { getAuthPlugins } from './plugins.js'

export * from './types.js'
export * from './auth.js'
export * from './utils.js'
export * from './transport.js'
export * from './framework.js'
export * from './registry.js'
export * from './validation.js'
export * from './config.js'

export * from 'better-auth/client/plugins'
export * from '@polar-sh/better-auth'
export * as BetterAuth from 'better-auth'

export { getAuthConfig } from './config.js'
export { getFrameworkContext } from './framework.js'
export type { AuthProvider } from './types.js'
export { registerAuthProvider } from './registry.js'
export { polarClient } from '@polar-sh/better-auth'
export { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
export { stripeClient } from '@better-auth/stripe/client'
