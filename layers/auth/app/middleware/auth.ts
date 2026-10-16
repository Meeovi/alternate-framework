export default defineNuxtRouteMiddleware(async (to) => {
    // Check the session through Nuxt's request-aware $fetch against a
    // RELATIVE url: Nitro answers /api/auth/get-session in-process (no HTTP
    // hop to better-auth's absolute baseURL — that's a server self-call
    // that hangs or fails on a slow/overloaded dev server and then bounces
    // a signed-in user), and useRequestFetch forwards the incoming Cookie
    // header on SSR. This replaces useAuth().getSession(), which still
    // targeted the absolute baseURL, which replaced useSession(useFetch),
    // which dropped the cookie entirely on SSR.
    let session: { user?: { role?: string | null } } | null = null
    try {
        session = await useRequestFetch()('/api/auth/get-session')
    } catch {
        // Fail closed: a session check that errors (overload, rate limit —
        // which anyone can trigger) must not render the protected page.
        // A 503 error page rather than a /login redirect, so a signed-in
        // user hitting a transient failure isn't bounced into a loop.
        return abortNavigation(createError({ statusCode: 503, statusMessage: "We couldn't verify your session. Please try again." }))
    }

    if (!session?.user) {
        return navigateTo({ path: "/login", query: { redirect: to.fullPath } })
    }

    // Optional role gate: `definePageMeta({ middleware: 'auth', roles: ['admin'] })`.
    // The business layer sets `roles` on /workspace pages from the tables
    // they render. Checked here (not in a separate middleware) because a
    // page's own definePageMeta middleware wins over one set by a
    // pages:extend hook, while `roles` from the hook survives. The data is
    // enforced again server-side; this is the page-level gate.
    const required = ([] as unknown[]).concat(to.meta.roles ?? []).map(String)
    if (required.length) {
        // better-auth roles are comma-separated ("user,seller").
        const roles = String(session.user.role || '').split(',').map((r) => r.trim())
        if (!required.some((r) => roles.includes(r))) {
            if (import.meta.client) {
                useSnackbar().show({ message: 'You are not authorized to access this page', color: 'error' })
            }
            return navigateTo('/workspace')
        }
    }
})
