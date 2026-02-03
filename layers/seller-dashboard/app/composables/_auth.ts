import { useNuxtApp, useState } from "nuxt/app"

export function getCurrentSellerId(): string | undefined {
  try {
    const nuxtApp = useNuxtApp() as any
    const authUser = nuxtApp?.$auth?.user ?? undefined
    if (authUser?.id && (authUser.role === 'seller' || (authUser.roles && authUser.roles.includes('seller')))) return authUser.id

    const stateUser = (useState as any)('authUser')?.value ?? (useState as any)('user')?.value
    if (stateUser?.id && (stateUser.role === 'seller' || (stateUser.roles && stateUser.roles.includes('seller')))) return stateUser.id

    return undefined
  } catch (e) {
    return undefined
  }
}
