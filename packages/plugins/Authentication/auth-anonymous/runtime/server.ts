import { anonymous } from 'better-auth/plugins'

/** Each anonymous sign-in creates a user row: 5 per IP per hour. */
export const ANONYMOUS_SIGN_IN_LIMIT = { window: 3600, max: 5 }

export default function anonymousPlugin() {
  // A plugin's own rate-limit rules apply unless the app's customRules
  // name the same path.
  return {
    ...anonymous({ emailDomainName: 'example.com' }),
    rateLimit: [
      { pathMatcher: (path: string) => path === '/sign-in/anonymous', ...ANONYMOUS_SIGN_IN_LIMIT },
    ],
  }
}
