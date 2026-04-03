import { betterAuth } from "better-auth"
import { emailOTP } from "better-auth/plugins"

export const otpAuth = betterAuth({
    // ... other config options
    plugins: [
        emailOTP({ 
            async sendVerificationOTP({ email, otp, type }) { 
                if (type === "sign-in") { 
                    // Send the OTP for sign in
                } else if (type === "email-verification") { 
                    // Send the OTP for email verification
                } else { 
                    // Send the OTP for password reset
                } 
            },
            allowedAttempts: 5, // Allow 5 attempts before invalidating the OTP
            otpLength: 8,
            expiresIn: 600
        }) 
    ]
})

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
