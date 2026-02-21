import { currentUser, currentServer } from '../composables/users'
import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import type { RouteLocationNormalized } from 'vue-router'
import { onHydrated, isHydrated } from '../composables/vue'

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server)
    return

  if (to.path === '/signin/callback')
    return

  if (isHydrated.value)
    return handleAuth(to)

  onHydrated(() => handleAuth(to))
})

function handleAuth(to: RouteLocationNormalized) {
  if (to.path === '/') {
    // Installed PWA shortcut to notifications
    if (to.query['notifications-pwa-shortcut'] !== undefined) {
      if (currentUser.value)
        return navigateTo('/notifications')
      else
        return navigateTo(`/${currentServer.value}/public/local`)
    }

    // Installed PWA shortcut to local
    if (to.query['local-pwa-shortcut'] !== undefined)
      return navigateTo(`/${currentServer.value}/public/local`)
  }

  if (!currentUser.value) {
    if (to.path === '/home' && to.query['share-target'] !== undefined)
      return navigateTo('/share-target')
    else
      return navigateTo(`/${currentServer.value}/public/local`)
  }

  if (to.path === '/')
    return navigateTo('/home')
}
