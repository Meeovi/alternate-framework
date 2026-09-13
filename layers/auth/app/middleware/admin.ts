export default defineNuxtRouteMiddleware(async (to) => {
  const snackbar = useSnackbar()
  // Relative-url request-aware fetch, not useAuth().getSession() (absolute
  // baseURL self-call) and not useSession(useFetch) (drops the cookie on
  // SSR). See middleware/auth.ts for the full rationale.
  let session: { user?: { role?: string } } | null = null
  try {
    session = await useRequestFetch()('/api/auth/get-session')
  } catch {
    // Don't bounce on a transient failure to reach the session endpoint.
    return
  }

  if (!session?.user) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (session.user.role !== 'admin') {
    snackbar.show({
      message: 'You are not authorized to access this page',
      color: 'error'
    })
    return navigateTo('/app/user')
  }
})
