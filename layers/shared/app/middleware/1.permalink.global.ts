import { defineNuxtRouteMiddleware, useRuntimeConfig } from "nuxt/app"
import { useAuth } from "alternate-auth/runtime/composables/useAuth"

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server)
    return

  if (!('server' in to.params))
    return

  const server = to.params.server as string

  try {
    const auth = useAuth() as any
    if (typeof auth?.fetchSession === 'function')
      await auth.fetchSession()
  }
  catch (e) {
    // ignore; best-effort
  }

  const auth = useAuth() as any
  const user = auth?.user?.value as any
  if (!user) {
    return
  }

  if (user.server === server)
    return

  if (to.params.tag)
    return

  if (!useRuntimeConfig().public.singleInstance && !to.params.server) {
    return {
      ...to,
      params: {
        ...to.params,
        server: user.server,
      },
    }
  }

  return '/home'
})

