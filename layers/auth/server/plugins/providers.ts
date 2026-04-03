import {
    betterAuth
} from "better-auth";
import {
    jwt
} from "better-auth/plugins";
import {
    oauthProvider
} from "@better-auth/oauth-provider";

const providersAuth = betterAuth({
    disabledPaths: [
        "/token",
    ],
    plugins: [
        jwt(),
        oauthProvider({
            loginPage: "/sign-in",
            consentPage: "/consent",
            allowDynamicClientRegistration: true,
            allowUnauthenticatedClientRegistration: true,
        })
    ],
});

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
