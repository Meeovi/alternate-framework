import { betterAuth } from "better-auth"
import { oAuthProxy } from "better-auth/plugins"

export const proxyAuth = betterAuth({
    plugins: [ 
        oAuthProxy({ 
            productionURL: "https://my-main-app.com", // Optional - if the URL isn't inferred correctly
            currentURL: "http://localhost:3000", // Optional - if the URL isn't inferred correctly
        }), 
    ] 
})