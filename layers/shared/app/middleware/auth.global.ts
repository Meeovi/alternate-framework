export default defineNuxtRouteMiddleware(async (to) => {
  // Avoid SSR self-fetch deadlocks during route resolution.
  if (import.meta.server) {
    return
  }

  const { session, fetchSession } = useAuth()
  try {
    await fetchSession()
  } catch {
    // Best-effort in middleware; route resolution should still continue.
  }

  const protectedPrefixes = ['/settings', '/profile']
  const isProtected = to.path === '/' || protectedPrefixes.some((route) => to.path.startsWith(route))

  if (isProtected && !session.value) {
    return navigateTo('/login')
  }

  const authRoutes = ['/login', '/register']
  if (authRoutes.includes(to.path) && session.value) {
    return navigateTo('/')
  }
})