import { betterAuth } from "better-auth"
import { admin as adminPlugin } from "better-auth/plugins"
import { ac, admin, user, myCustomRole } from "./permissions"

export const adminAuth = betterAuth({
    // ... other config options
    plugins: [
        adminPlugin({
            ac,
            roles: {
                admin,
                user,
                myCustomRole
            }
        }),
    ],
});