import {
  createAuthClient
} from "better-auth/vue";
import {
  twoFactorClient,
  usernameClient,
  anonymousClient,
  phoneNumberClient,
  magicLinkClient,
  emailOTPClient,
  genericOAuthClient,
  oneTapClient,
  adminClient,
  organizationClient,
  deviceAuthorizationClient,
  lastLoginMethodClient,
  multiSessionClient,
  oneTimeTokenClient,
  jwtClient
} from "better-auth/client/plugins"
import {
  apiKeyClient
} from "@better-auth/api-key/client"
import {
  passkeyClient
} from "@better-auth/passkey/client"
import {
  oauthProviderClient
} from "@better-auth/oauth-provider/client"
import {
  ssoClient
} from "@better-auth/sso/client"
import {
  stripeClient
} from "@better-auth/stripe/client"

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect({
        twoFactorMethods
      }) {
        // twoFactorMethods is e.g. ["totp", "otp"]
        window.location.href = "/2fa" // Handle the 2FA verification redirect
      }
    }),
    stripeClient({
      subscription: true //if you want to enable subscription management
    }),
    usernameClient(),
    anonymousClient(),
    phoneNumberClient(),
    magicLinkClient(),
    emailOTPClient(),
    passkeyClient(),
    genericOAuthClient(),
    oneTapClient({
      clientId: `${process.env.BETTER_AUTH_GOOGLE_CLIENT_ID}`,
      // Optional client configuration:
      autoSelect: false,
      cancelOnTapOutside: true,
      context: "signin",
      additionalOptions: {
        // Any extra options for the Google initialize method
      },
      // Configure prompt behavior and exponential backoff:
      promptOptions: {
        baseDelay: 1000, // Base delay in ms (default: 1000)
        maxAttempts: 5 // Maximum number of attempts before triggering onPromptNotification (default: 5)
      }
    }),
    adminClient(),
    apiKeyClient(),
    organizationClient({
      schema: {
        organizationRole: {
          additionalFields: {
            color: {
              type: "string",
              defaultValue: "#ffffff",
            }
          }
        }
      },
      teams: {
        enabled: true,
        maximumTeams: 10, // Optional: limit teams per organization
        allowRemovingAllTeams: false, // Optional: prevent removing the last team
      },
    }),
    oauthProviderClient(),
    ssoClient(),
    deviceAuthorizationClient(),
    lastLoginMethodClient(),
    multiSessionClient(),
    oneTimeTokenClient(),
    jwtClient()
  ]
})

export const {
  signIn,
  signUp,
  signOut,
  useSession
} = authClient;