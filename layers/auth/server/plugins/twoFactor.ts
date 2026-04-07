import { betterAuth } from "better-auth"
import { twoFactor, username } from "better-auth/plugins"

export const twoFactorAuth = () => betterAuth({
    appName: process.env.APP_NAME, // provide your app name. It'll be used as an issuer.
    plugins: [
        twoFactor({
          	otpOptions: {
				async sendOTP({ user, otp }, ctx) {
                    // send otp to user
				},
			},
        })        
    ]
})

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
