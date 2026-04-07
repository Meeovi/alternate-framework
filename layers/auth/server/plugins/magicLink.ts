import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";

export const magicLinkAuth = () => betterAuth({
    plugins: [
        magicLink({
            sendMagicLink: async ({ email, token, url }, ctx) => {
                try {
                    // Prefer core mailer if available
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const core = require('alternate-gateway/core')
                    if (core?.sendEmail && typeof core.sendEmail === 'function') {
                        await core.sendEmail({ to: email, subject: 'Your sign-in link', html: `Click <a href="${url}">here</a>` })
                        return
                    }
                } catch (e) {
                    // fallthrough to console log
                }

                // Fallback: log the magic link (useful for local/dev)
                // In production, replace with a real mailer.
                // eslint-disable-next-line no-console
                console.info('Magic link for', email, url)
            }
        })
    ]
})

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})
