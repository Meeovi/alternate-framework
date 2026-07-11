import { betterAuth } from "better-auth"
import { multiSession } from "better-auth/plugins"

export const multiSessionAuth = betterAuth({
    plugins: [ 
        multiSession(), 
    ] 
})