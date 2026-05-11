import { betterAuth } from "better-auth"
import { testUtils } from "better-auth/plugins"

export const testAuth = betterAuth({
    plugins: [
        ...(process.env.NODE_ENV === "test"
            ? [testUtils({ captureOTP: true })]
            : [])
    ]
})