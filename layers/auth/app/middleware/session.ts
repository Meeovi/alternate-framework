import { defineNuxtRouteMiddleware, useCookie } from "nuxt/app"

export default defineNuxtRouteMiddleware(() => {
  const session = useCookie('session')

  if (!session.value) {
    session.value = {
      id: crypto.randomUUID(),
      date_created: new Date().toISOString()
    } as any
  }
})
