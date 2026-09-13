export default defineNuxtRouteMiddleware(async (to) => {
    // Check the session through Nuxt's request-aware $fetch against a
    // RELATIVE url: Nitro answers /api/auth/get-session in-process (no HTTP
    // hop to better-auth's absolute baseURL — that's a server self-call
    // that hangs or fails on a slow/overloaded dev server and then bounces
    // a signed-in user), and useRequestFetch forwards the incoming Cookie
    // header on SSR. This replaces useAuth().getSession(), which still
    // targeted the absolute baseURL, which replaced useSession(useFetch),
    // which dropped the cookie entirely on SSR.
    let session: { user?: unknown } | null = null
    try {
        session = await useRequestFetch()('/api/auth/get-session')
    } catch {
        // A transient fetch failure is not the same as "logged out" — let
        // the route load and let its own data calls surface a real 401,
        // rather than redirect-looping a user who has a valid session.
        return
    }

    if (!session?.user) {
        return navigateTo({ path: "/login", query: { redirect: to.fullPath } })
    }
})
