// src/runtime/middleware/auth.global.ts
import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAdapterAuthClient } from '../composables/useAuthClient'

export default defineNuxtRouteMiddleware(async (to) => {
  // Convention: routes can define meta.auth = 'user' | 'guest' | 'admin' | boolean
  const authMeta = to.meta.auth

  if (!authMeta) return

  const authClient = useAdapterAuthClient()
  const { data: session } = await authClient.useSession()

  const isLoggedIn = !!session.value

  if (authMeta === 'user' && !isLoggedIn) {
    return navigateTo('/auth/login')
  }

  if (authMeta === 'guest' && isLoggedIn) {
    return navigateTo('/')
  }

  // You can extend this to roles:
  // if (typeof authMeta === 'object' && authMeta.role && !session.value?.roles?.includes(authMeta.role)) { ... }
})