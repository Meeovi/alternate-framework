import { defineNuxtRouteMiddleware, useCookie } from 'nuxt/app'

export default defineNuxtRouteMiddleware(() => {
  const session = useCookie('session')
  const sessionId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`

  if (!session.value) {
    session.value = {
      id: sessionId(),
      date_created: new Date().toISOString(),
    } as any
  }
})