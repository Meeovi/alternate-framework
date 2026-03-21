import { betterAuth } from "better-auth"

// load phoneNumber plugin at runtime to avoid compile-time export mismatches
const phoneNumberPlugin: any = (() => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require('better-auth/plugins').phoneNumber
    } catch (e) {
        return null
    }
})()

let twilioClient: any = null
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tw = require('twilio')
    twilioClient = tw(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
} catch (e) {
    // twilio not configured or not installed — fallback to other senders
}

export const phoneNumberAuth = betterAuth({
    plugins: phoneNumberPlugin
        ? [
                phoneNumberPlugin({
            sendOTP: async ({ phoneNumber, code }: { phoneNumber: string; code: string }, ctx: any) => {
                // Prefer using Twilio Verify if configured
                if (twilioClient && process.env.TWILIO_VERIFY_SERVICE_SID) {
                    try {
                        await twilioClient.verify
                            .services(`${process.env.TWILIO_VERIFY_SERVICE_SID}`)
                            .verificationChecks.create({ to: phoneNumber, code })
                        return
                    } catch (e) {
                        // fallback to console
                    }
                }

                // Try core SMS sender if provided
                try {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const core = require('@mframework/core')
                    if (core?.sendSms && typeof core.sendSms === 'function') {
                        await core.sendSms({ to: phoneNumber, text: `Your verification code is ${code}` })
                        return
                    }
                } catch (e) {
                    // ignore
                }

                // Fallback: log code (dev)
                // eslint-disable-next-line no-console
                console.info('OTP for', phoneNumber, code)
            },

                signUpOnVerification: {
                getTempEmail: (phoneNumber: string) => `${phoneNumber}@my-site.com`,
                getTempName: (phoneNumber: string) => phoneNumber,
            },

            callbackOnVerification: async ({ phoneNumber, user }: { phoneNumber: string; user: any }, ctx: any) => {
                // Example: call optional core hook if available
                try {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const core = require('@mframework/core')
                    if (core?.onPhoneVerified) {
                        await core.onPhoneVerified({ phoneNumber, user })
                    }
                } catch (e) {
                    // ignore
                }
            },

            verifyOTP: async ({ phoneNumber, code }: { phoneNumber: string; code: string }, ctx: any) => {
                if (twilioClient && process.env.TWILIO_VERIFY_SERVICE_SID) {
                    try {
                        const resp = await twilioClient.verify
                            .services(`${process.env.TWILIO_VERIFY_SERVICE_SID}`)
                            .verificationChecks.create({ to: phoneNumber, code })
                        return resp.status === 'approved'
                    } catch (e) {
                        return false
                    }
                }

                // fallback: no verification capability — fail safe
                return false
            },
                }),
            ]
        : [],
})