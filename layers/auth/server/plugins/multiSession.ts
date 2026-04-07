import { betterAuth } from "better-auth"
import { multiSession } from "better-auth/plugins"

export const multiSessionAuth = () => betterAuth({
    plugins: [ 
        multiSession(), 
    ] 
})

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
