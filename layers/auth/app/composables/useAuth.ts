import type { Subscription } from '@better-auth/stripe'
import type { CustomerState } from '@polar-sh/sdk/models/components/customerstate.js'
import type { BetterAuthClientOptions, InferSessionFromClient, User } from 'better-auth/client'
import { createAuthClient } from 'better-auth/client'
import { getAuthPlugins } from '../utils/plugins'

export type UseAuthOptions = {
  /** An existing auth client. If provided, it's used as-is. */
  client ? : any
  /** Base URL for the auth client if creating one. */
  baseURL ? : string
  /** Optional headers to send with requests. */
  headers ? : Record < string,
  string >
  /** Payment provider: 'stripe' or 'polar'. If omitted, 'stripe' is assumed. */
  payment ? : 'stripe' | 'polar'
  /** Optional app-level reload/redirect function (framework-specific). */
  reload ? : (opts: {
    path ? : string
  }) => Promise < void >
}

export function useAuth(options: UseAuthOptions = {}) {
  const {
    client: providedClient,
    baseURL,
    headers,
    payment = 'stripe',
    reload
  } = options

  // Resolve a client in this order:
  // 1. providedClient (explicit)
  // 2. adapter provider (if adapter-betterauth is present)
  // 3. local createAuthClient fallback
  let client: any = providedClient || null

  if (!client) {
    // Attempt to use adapter registry/provider if available
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const adapter = require('@mframework/adapter-betterauth')
      if (adapter && typeof adapter.getAuthProvider === 'function') {
        const prov = adapter.getAuthProvider()
        // Wrap provider methods into a minimal client-like interface
        client = {
          async getSession() {
            const s = await prov.session()
            return { data: { session: s, user: (s && s.user) || null } }
          },
          signIn: prov.login?.bind(prov),
          signUp: prov.register?.bind(prov),
          signOut: prov.logout?.bind(prov),
          refresh: prov.refresh?.bind(prov),
          subscription: { list: async () => ({ data: [] }) },
          $ERROR_CODES: {},
        }
      }
    } catch (e) {
      // adapter-betterauth not available — fall back to client library below
    }
  }

  if (!client) {
    client = createAuthClient({
      baseURL: baseURL || undefined,
      fetchOptions: { headers },
      socialProviders: {
        github: { clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET! },
        microsoft: { clientId: process.env.MICROSOFT_CLIENT_ID!, clientSecret: process.env.MICROSOFT_CLIENT_SECRET! },
        twitter: { clientId: process.env.TWITTER_CLIENT_ID!, clientSecret: process.env.TWITTER_CLIENT_SECRET! }
      },
      plugins: getAuthPlugins({ subscription: true })
    })
  }

  let session: InferSessionFromClient < BetterAuthClientOptions > | null = null
  let user: User | null = null
  let subscriptions: Subscription[] = []
  let polarState: CustomerState | null = null
  let sessionFetching = false

  const fetchSession = async () => {
    if (sessionFetching) return
    sessionFetching = true
    const {
      data
    } = await client.getSession()
    session = data?.session || null

    const userDefaults = {
      image: null,
      role: null,
      banReason: null,
      banned: null,
      banExpires: null,
      stripeCustomerId: null
    }
    user = data?.user ? Object.assign({}, userDefaults, data.user) : null
    subscriptions = []
    if (user) {
      if (payment == 'stripe') {
        const {
          data: subscriptionData
        } = await client.subscription.list()
        subscriptions = subscriptionData || []
      } else if (payment == 'polar') {
        const {
          data: customerState
        } = await client.customer.state()
        polarState = customerState
      }
    }
    sessionFetching = false
    return data
  }

  if (client?.$store?.listen) {
    client.$store.listen('$sessionSignal', async (signal: any) => {
      if (!signal) return
      await fetchSession()
    })
  }

  return {
    session,
    user,
    subscription: client.subscription,
    subscriptions,
    loggedIn: () => !!session,
    activeStripeSubscription: () => {
      return subscriptions.find((sub: {
        status: string
      }) => sub.status === 'active' || sub.status === 'trialing')
    },
    activePolarSubscriptions: () => {
      return polarState?.activeSubscriptions
    },
    signIn: client.signIn,
    signUp: client.signUp,
    forgetPassword: client.forgetPassword,
    resetPassword: client.resetPassword,
    sendVerificationEmail: client.sendVerificationEmail,
    errorCodes: client.$ERROR_CODES,
    async signOut({
      redirectTo
    }: {
      redirectTo ? : string
    } = {}) {
      await client.signOut({
        fetchOptions: {
          onSuccess: async () => {
            session = null
            user = null
            if (redirectTo && typeof reload === 'function') {
              await reload({
                path: redirectTo.toString()
              })
            }
          }
        }
      })
    },
    fetchSession,
    payment,
    client
  }
}