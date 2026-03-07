import { betterAuth } from "better-auth";
import { mcp } from "better-auth/plugins";

export const mcpAuth = betterAuth({
    plugins: [
        mcp({
            loginPage: "/sign-in" // path to your login page
        })
    ]
}) as ReturnType<typeof betterAuth>;