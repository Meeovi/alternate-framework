import { authClient } from "../../lib/auth-client"

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: sessionData } = await useAuth().useSession(useFetch)
  const session = (sessionData as any).value

  if (!session) {
    return navigateTo('/')
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
