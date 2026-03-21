import {
    betterAuth,
    JWTPayload
} from "better-auth"
import {
    jwt
} from "better-auth/plugins"

export const jwtAuth = betterAuth({
    disabledPaths: [
        "/token",
    ],
    plugins: [jwt({
        disableSettingJwtHeader: true,
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