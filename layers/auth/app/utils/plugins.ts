export type AuthPluginOptions = { subscription?: boolean }

export function getAuthPlugins(opts: AuthPluginOptions = {}): any[] {
  const { subscription = true } = opts

  const plugins: any[] = []

  // Try to load adapter-provided plugin helpers when available, otherwise
  // return an empty plugin list (safer for build-time without adapters).
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const adapter = require('@mframework/adapter-betterauth')
    const inferAdditionalFields = adapter.inferAdditionalFields || adapter.default?.inferAdditionalFields
    const adminClient = adapter.adminClient || adapter.default?.adminClient
    const polarClient = adapter.polarClient || adapter.default?.polarClient

    if (inferAdditionalFields) {
      plugins.push(
        inferAdditionalFields({
          user: { polarCustomerId: { type: 'string' } }
        })
      )
    }

    if (adminClient) plugins.push(adminClient())
    if (polarClient) plugins.push(polarClient())
  } catch (e) {
    // adapter not present — ignore
  }

  // Try to load stripe client plugin separately
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const stripe = require('@better-auth/stripe/client')
    const stripeClient = stripe?.stripeClient || stripe?.default || stripe
    if (typeof stripeClient === 'function') plugins.push(stripeClient({ subscription }))
  } catch (e) {
    // stripe plugin not available — ignore
  }

  return plugins
}
