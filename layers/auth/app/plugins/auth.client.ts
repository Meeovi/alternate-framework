export default defineNuxtPlugin(async (nuxtApp) => {
  const auth = useAuth()

  if (!nuxtApp.payload.serverRendered) {
    await auth.fetchSession()
    return
  }

  // Revalidate on mount so browser cookies always win after restarts or stale SSR payloads.
  nuxtApp.hook('app:mounted', async () => {
    await auth.fetchSession()
  })
})