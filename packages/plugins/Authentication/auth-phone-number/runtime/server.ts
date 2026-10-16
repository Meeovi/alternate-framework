import { APIError } from 'better-auth/api'
import { phoneNumber } from 'better-auth/plugins'

/**
 * Sends the sign-in code. No SMS provider is wired up yet: production
 * refuses rather than "send" a code nobody receives (and that would only
 * exist in the server log); the console fallback is for development only.
 */
export async function sendPhoneOTP({ phoneNumber, code }: { phoneNumber: string, code: string }) {
  if (process.env.NODE_ENV === 'production') {
    throw new APIError('NOT_IMPLEMENTED', { message: 'Phone sign-in is not available yet.' })
  }
  console.info('[phone-otp] dev OTP for', phoneNumber, code)
}

export default function phoneNumberPlugin() {
  return phoneNumber({
    sendOTP: sendPhoneOTP,
    signUpOnVerification: {
      getTempEmail: (phone) => `${phone}@example.com`,
      getTempName: (phone) => phone,
    },
  })
}
