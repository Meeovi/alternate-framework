// Social pages need a signed-in user (nuxt.config.ts marks every page this
// layer provides, and every page under /connect, with `requiresLogin`). The
// path check also covers /connect URLs that match no page, so a guest gets
// the login page, not a 404. Same session check as the auth layer's `auth`
// middleware, which pages that declare it already run.
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.meta.requiresLogin && !/^\/connect(\/|$)/.test(to.path)) return
  const declared = ([] as unknown[]).concat(to.meta.middleware ?? [])
  if (declared.includes('auth')) return

  let session: { user?: unknown } | null = null
  try {
    session = await useRequestFetch()('/api/auth/get-session')
  } catch {
    // Fail closed (see the auth layer's middleware/auth.ts).
    return abortNavigation(createError({ statusCode: 503, statusMessage: "We couldn't verify your session. Please try again." }))
  }
  if (!session?.user) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
