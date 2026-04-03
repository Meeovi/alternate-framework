import { betterAuth } from "better-auth"
import { username } from "better-auth/plugins"

const usernameAuth = betterAuth({
    emailAndPassword: {
        enabled: true,
    },
    disablePaths: ["/is-username-available"],
    plugins: [
        username({
            minUsernameLength: 5,
            maxUsernameLength: 100,
            usernameValidator: (username) => {
                if (username === "admin") {
                    return false
                }
                return true
            },
            displayUsernameValidator: (displayUsername) => {
                // Allow only alphanumeric characters, underscores, and hyphens
                return /^[a-zA-Z0-9_-]+$/.test(displayUsername)
            },
            usernameNormalization: (username) => {
                return username.toLowerCase()
                    .replace("0", "o")
                    .replace("3", "e")
                    .replace("4", "a");
            },
            displayUsernameNormalization: (displayUsername) => displayUsername.toLowerCase(),
            validationOrder: {
                username: "post-normalization",
                displayUsername: "post-normalization",
            }
        })
    ]
})

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
