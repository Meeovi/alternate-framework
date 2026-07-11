import { betterAuth } from "better-auth"
import { passkey } from "@better-auth/passkey"

export const passkeyAuth = betterAuth({
    plugins: [ 
        passkey(), 
    ], 
})