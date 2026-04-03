import { betterAuth } from "better-auth"
import { openAPI } from "better-auth/plugins"

export const openApiAuth = betterAuth({
    plugins: [ 
        openAPI(), 
    ] 
})

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
