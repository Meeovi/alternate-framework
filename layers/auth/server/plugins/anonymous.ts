import { randomUUID } from 'node:crypto'
import { betterAuth } from "better-auth"
import { anonymous } from "better-auth/plugins"

export const anonymousAuth = () => betterAuth({
    // ... other config options
    plugins: [
        anonymous({
            onLinkAccount: async ({ anonymousUser, newUser }) => {
               // perform actions like moving the cart items from anonymous user to the new user
            },
            emailDomainName: "example.com", // -> temp-{id}@example.com
            generateRandomEmail: () => { 
                const id = randomUUID() 
                return `guest-${id}@example.com`
            }
        })
    ]
})

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
