import {
  createAuthClient,
} from 'better-auth/vue'
import {
  twoFactorClient,
  usernameClient,
  anonymousClient,
  phoneNumberClient,
  magicLinkClient,
  emailOTPClient,
  genericOAuthClient,
  oneTapClient,
  siweClient,
  adminClient,
  organizationClient,
  deviceAuthorizationClient,
  lastLoginMethodClient,
  multiSessionClient,
  oneTimeTokenClient,
  jwtClient,
} from 'better-auth/client/plugins'
import {
  passkeyClient,
} from '@better-auth/passkey/client'
import {
  apiKeyClient,
} from '@better-auth/api-key/client'
import {
  oauthProviderClient,
} from '@better-auth/oauth-provider/client'
import {
  ssoClient,
} from '@better-auth/sso/client'
import {
  stripeClient,
} from '@better-auth/stripe/client'
import {
  dashClient,
  sentinelClient,
} from '@better-auth/infra/client'
//import { polarClient } from '@polar-sh/better-auth/client'

export const authClient = createAuthClient({
  fetchOptions: {
    auth: {
      type: 'Bearer',
      token: () => localStorage.getItem('bearer_token') || '', // get the token from localStorage
    },
    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get('set-auth-token') // get the token from the response headers
      // Store the token securely (e.g., in localStorage)
      if (authToken) {
        localStorage.setItem('bearer_token', authToken)
      }
    },
  },
  plugins: [
    twoFactorClient(),
    usernameClient(),
    anonymousClient(),
    phoneNumberClient(),
    magicLinkClient(),
    emailOTPClient(),
    passkeyClient(),
    genericOAuthClient(),
    oneTapClient({
      clientId: `${process.env.GOOGLE_CLIENT_ID}`,
      // Optional client configuration:
      autoSelect: false,
      cancelOnTapOutside: true,
      context: 'signin',
      additionalOptions: {
        // Any extra options for the Google initialize method
      },
      // Configure prompt behavior and exponential backoff:
      promptOptions: {
        baseDelay: 1000, // Base delay in ms (default: 1000)
        maxAttempts: 5, // Maximum number of attempts before triggering onPromptNotification (default: 5)
      },
    }),
    siweClient(),
    adminClient(),
    apiKeyClient(),
    organizationClient(),
    oauthProviderClient(),
    ssoClient(),
    deviceAuthorizationClient(),
    lastLoginMethodClient(),
    multiSessionClient(),
    oneTimeTokenClient(),
    jwtClient(),
    //polarClient(),
    stripeClient({
      subscription: true,
    }),
    sentinelClient({
      autoSolveChallenge: true,
    }),
    dashClient(),
  ],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient

type AuthClientBridge = {
  forgotPassword?: (...args: unknown[]) => unknown
  resetPassword?: (...args: unknown[]) => unknown
}

const authClientBridge = authClient as AuthClientBridge

// better-auth client method names vary by version/plugins, so keep a guarded bridge.
export const forgotPassword = (...args: unknown[]) => authClientBridge.forgotPassword?.(...args)
export const forgetPassword = (...args: unknown[]) => authClientBridge.forgotPassword?.(...args)
export const resetPassword = (...args: unknown[]) => authClientBridge.resetPassword?.(...args)
