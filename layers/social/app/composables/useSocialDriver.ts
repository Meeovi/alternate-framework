import type { SocialDriverContract } from '@mframework/alternate-sdk/contracts/social'

/**
 * Client-side proxy to the server-side social driver.
 *
 * Instead of accessing `nuxtApp.$sdk.social` directly (which requires the
 * `alternate-sdk` Nitro plugin to have run and populated `$sdk`), this
 * composable forwards method calls to the server endpoint
 * `POST /api/social/driver`. The server handler resolves the actual driver
 * and executes the call.
 *
 * This keeps the frontend backend-agnostic — it only depends on HTTP and
 * the `SocialDriverContract` method names, not on any specific backend SDK.
 */
function callSocial(method: string, ...args: unknown[]): Promise<any> {
  if (!method) return Promise.resolve(undefined)

  return $fetch('/api/social/driver', {
    method: 'POST',
    body: { method, args: args.length > 0 ? args : undefined },
  }).catch(() => undefined)
}

export function useSocialDriver(): SocialDriverContract {
  return new Proxy({} as SocialDriverContract, {
    get(_target, prop: string) {
      // Only proxy known function-like property names; non-method access
      // returns undefined so callers can use optional chaining (?.)
      return (...args: unknown[]) => callSocial(prop, ...args)
    },
  })
}

export default useSocialDriver
