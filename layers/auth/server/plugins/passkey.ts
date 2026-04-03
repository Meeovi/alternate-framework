import { betterAuth } from "better-auth"
import { passkey } from "@better-auth/passkey"

export const passkeyAuth = betterAuth({
    plugins: [ 
        passkey(), 
    ], 
})

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
