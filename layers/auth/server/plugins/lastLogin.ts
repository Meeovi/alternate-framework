import { betterAuth } from "better-auth"
import { lastLoginMethod } from "better-auth/plugins"

export const lastLoginAuth = betterAuth({
    plugins: [
        lastLoginMethod({
            // Cookie configuration
            cookieName: "better-auth.last_used_login_method", // Default: "better-auth.last_used_login_method"
            maxAge: 60 * 60 * 24 * 30, // Default: 30 days in seconds
            
            // Database persistence
            storeInDatabase: false, // Default: false
            
            // Custom method resolution
            customResolveMethod: (ctx) => {
                // Custom logic to determine the login method
                if (ctx.path === "/oauth/callback/custom-provider") {
                    return "custom-provider"
                }
                // Return null to use default resolution
                return null
            },
            
            // Schema customization (when storeInDatabase is true)
            schema: {
                user: {
                    lastLoginMethod: "custom_field_name"
                }
            }
        })
    ]
})

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
