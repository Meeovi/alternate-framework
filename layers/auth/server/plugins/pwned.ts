import { betterAuth } from "better-auth"
import { haveIBeenPwned } from "better-auth/plugins"

export const pwnedAuth = betterAuth({
    plugins: [
        haveIBeenPwned()
    ]
})

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
