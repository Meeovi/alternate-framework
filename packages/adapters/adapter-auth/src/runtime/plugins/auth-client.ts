import {
  createAuthClient
} from "better-auth/client"
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
  apiKeyClient,
  organizationClient,
  deviceAuthorizationClient,
  lastLoginMethodClient,
  oidcClient,
  multiSessionClient,
  oneTimeTokenClient,
  jwtClient
} from "better-auth/client/plugins"
import {
  passkeyClient
} from "@better-auth/passkey/client"
import {
  oauthProviderClient
} from "@better-auth/oauth-provider/client"
import {
  ssoClient
} from "@better-auth/sso/client"
import { polarClient } from "@polar-sh/better-auth/client";

export const authClient = createAuthClient({
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem("bearer_token") || "" // get the token from localStorage
    }
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
    polarClient(),
    oidcClient({
      // Your OIDC configuration
    }),
    oneTapClient({
      clientId: process.env.GOOGLE_CLIENT_ID!,
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
    })
  ]
})