import type { SocialDriverContract } from 'alternate-sdk/contracts'

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

// SocialDriverContract nests most operations under posts/comments/feed/
// spaces/vibez (e.g. `social.posts.getPosts()`, not `social.getPosts()`).
// Building the proxy on a callable target (rather than a plain object)
// lets each property access chain into another proxy that is itself both
// traversable (`.get`) and invocable (`.apply`), so arbitrary nesting depth
// forwards to the server as a dotted method path (e.g. "posts.getPosts")
// without this composable needing to special-case which names are nested.
function createSocialProxy(path: string[]): any {
  return new Proxy(() => {}, {
    get(_target, prop: string) {
      return createSocialProxy([...path, prop])
    },
    apply(_target, _thisArg, args: unknown[]) {
      return callSocial(path.join('.'), ...args)
    },
  })
}

export function useSocialDriver(): SocialDriverContract {
  return createSocialProxy([])
}

export default useSocialDriver
