import { betterAuth } from "better-auth"
import { apiKey } from "better-auth/plugins"

export const apiKeyAuth = betterAuth({
    plugins: [ 
        apiKey() 
    ] 
})