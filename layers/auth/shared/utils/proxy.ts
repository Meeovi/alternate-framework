import { betterAuth } from "better-auth"
import { oAuthProxy } from "better-auth/plugins"

export const proxyAuth = betterAuth({
    plugins: [ 
        oAuthProxy({ 
            productionURL: `${process.env.NUXT_PUBLIC_SITE_URL}`, // Optional - if the URL isn't inferred correctly
            currentURL: `${process.env.NUXT_APP_URL}`, // Optional - if the URL isn't inferred correctly
        }), 
    ] 
})