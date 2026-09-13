import { authClient } from "../../lib/auth-client"

export default defineNuxtRouteMiddleware(async (to) => {
  // Relative-url request-aware fetch, not useAuth().getSession() (absolute
  // baseURL self-call) and not useSession(useFetch) (drops the cookie on
  // SSR). See middleware/auth.ts for the full rationale.
  let session: { user?: unknown } | null = null
  try {
    session = await useRequestFetch()('/api/auth/get-session')
  } catch {
    return
  }

  if (!session?.user) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (to.path !== '/onboarding') {
    try {
      const { data: orgs } = await (authClient as any).organization.list()
      if (!orgs || orgs.length === 0) {
        console.log('User needs onboarding, redirecting...')
        return navigateTo('/onboarding')
      }
    } catch {
      // Organization plugin may not be available, allow access
    }
  }
})
