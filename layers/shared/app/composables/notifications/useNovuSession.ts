export interface NovuSession {
  applicationIdentifier: string
  subscriberId: string
  subscriberHash: string
}

// Module-level cache: the session is the same for the lifetime of a page
// load (one $fetch, however many components mount a Novu widget — the bell
// in the header and the /notifications page can both call this).
let cached: Promise<NovuSession | null> | undefined

/**
 * Resolves the current user's Novu subscriber credentials from
 * layers/shared/server/api/novu/session.get.ts. Returns null (not a throw)
 * for a logged-out visitor (the endpoint 401s via requireAuth) so callers
 * can just skip mounting a Novu widget instead of handling an exception.
 */
export function useNovuSession(): Promise<NovuSession | null> {
  if (cached === undefined) {
    cached = $fetch<NovuSession>('/api/novu/session').catch((error) => {
      if (error?.statusCode !== 401) {
        console.error('[notifications] failed to load Novu session', error)
      }
      return null
    })
  }
  return cached
}
