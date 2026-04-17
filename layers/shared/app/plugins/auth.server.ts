import { useAuth } from '../composables/useAuth'

export default defineNuxtPlugin({
  name: 'better-auth-fetch-plugin',
  enforce: 'pre',
  async setup(nuxtApp) {
    const requestEvent = useRequestEvent()
    const requestPath = requestEvent?.path || ''
    const internalAuthFetch = requestEvent?.node?.req?.headers?.['x-auth-internal']

    // DISABLED in dev: HTTP hang investigation
    // Re-enable in production when Vite issue is fully resolved
    if (process.env.NODE_ENV === 'development') {
      return
    }

    // Prevent recursive API calls during SSR session hydration.
    if (requestPath.startsWith('/api/') || internalAuthFetch === '1') {
      return
    }

    // Flag if request is cached
    nuxtApp.payload.isCached = Boolean(requestEvent?.context.cache)
    if (nuxtApp.payload.serverRendered && !nuxtApp.payload.prerenderedAt && !nuxtApp.payload.isCached) {
      try {
        await useAuth().fetchSession()
      } catch {
        // Session hydration should be best-effort and must not fail SSR rendering.
      }
    }
  }
})