import { betterAuth } from "better-auth"
import { apiKey } from "better-auth/plugins"

export const apiKeyAuth = betterAuth({
    plugins: [ 
        apiKey() 
    ] 
})

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
