// Social pages need a signed-in user (nuxt.config.ts marks every page this
// layer provides with `requiresLogin`). Same session check as the auth
// layer's `auth` middleware, which pages that declare it already run.
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.meta.requiresLogin) return
  const declared = ([] as unknown[]).concat(to.meta.middleware ?? [])
  if (declared.includes('auth')) return

  let session: { user?: unknown } | null = null
  try {
    session = await useRequestFetch()('/api/auth/get-session')
  } catch {
    // A failed check isn't "logged out": let the page's own data calls
    // surface a real 401 rather than bouncing a signed-in user.
    return
  }
  if (!session?.user) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
