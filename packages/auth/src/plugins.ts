import { stripeClient } from '@better-auth/stripe/client'
import { polarClient } from '@polar-sh/better-auth'
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'

export type AuthPluginOptions = {
  /** whether to enable subscription support for stripe plugin */
  subscription?: boolean
}

export function getAuthPlugins(opts: AuthPluginOptions = {}): any[] {
  const { subscription = true } = opts

  return [
    inferAdditionalFields({
      user: {
        polarCustomerId: {
          type: 'string'
        }
      }
    }),
    adminClient(),
    polarClient(),
    stripeClient({ subscription })
  ]
}
