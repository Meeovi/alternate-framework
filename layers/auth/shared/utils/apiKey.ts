import { betterAuth } from "better-auth"
import { apiKey } from "@better-auth/api-key"

export const apiKeyAuth = betterAuth({
    plugins: [ 
        apiKey() 
    ] 
})