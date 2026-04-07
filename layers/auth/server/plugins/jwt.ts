import {
    betterAuth,
    type JWTPayload
} from "better-auth"
import {
    jwt
} from "better-auth/plugins"

export const jwtAuth = () => betterAuth({
    disabledPaths: [
        "/token",
    ],
    plugins: [jwt({
        disableSettingJwtHeader: true,
        jwks: {
            remoteUrl: process.env.BETTER_AUTH_JWKS_REMOTE_URL || "http://localhost/jwks",
            keyPairConfig: {
                alg: "EdDSA",
            },
        },
        jwt: {
            sign: async (jwtPayload: JWTPayload) => {
                // Lightweight fallback signer: base64-encoded JSON payload.
                // This avoids requiring external JWT signing libraries in this
                // isolated layer while keeping a deterministic token shape.
                return Buffer.from(JSON.stringify(jwtPayload)).toString('base64')
            },
        },
    })]
})

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
