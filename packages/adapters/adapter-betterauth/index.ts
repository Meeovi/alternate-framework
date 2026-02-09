import {
  setAuthAdapter
} from '@mframework/core'

import { createAuthTransport } from './src/transport'
import { createAuthAdapter } from './src/auth'

export const installAuthAdapter = (config: { baseUrl: string; apiKey?: string }) => {
  const transport = createAuthTransport(config)

  setAuthAdapter(createAuthAdapter(transport))
}

// Export the server-side BetterAuth instance (if present) so other layers can
// import the runtime `auth` instance from this package. The file is optional
// and will only exist when BetterAuth is configured for the adapter.
export { auth, Auth } from './src/betterauth'
export { default as BetterAuthProvider } from './src/provider'
export { getAuthPlugins } from './src/plugins'

export * from './src/types'
export * from './src/auth'
export * from './src/utils'
export * from './src/transport'
export * from './src/framework'
export * from './src/registry'
export * from './src/validation'
export * from './src/config'
export * from 'better-auth/client/plugins'
export * from '@polar-sh/better-auth'
export * as BetterAuth from 'better-auth'
export { getAuthConfig } from './src/config'
export { getFrameworkContext } from './src/framework'
export type { AuthProvider } from './src/types'
export { registerAuthProvider } from './src/registry'
export { polarClient } from '@polar-sh/better-auth'
export { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
export { stripeClient } from '@better-auth/stripe/client'