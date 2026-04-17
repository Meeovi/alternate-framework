import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {
  // Allow configuration via runtime config public.rocketchat or env ROCKETCHAT_URL
  const config = (nuxtApp?.$config || (globalThis as any).$config || {})
  const rc = (config.public && config.public.rocketchat) || (config.rocketchat) || {}
  const baseUrl = process.env.ROCKETCHAT_URL || rc.baseUrl
  if (!baseUrl) return

  try {
    const pkg = '@mframework/adapter-rocketchat'
    const mod = await import(/* @vite-ignore */ pkg)
  // DISABLED: Dynamic import causing Vite invalidation loop in dev
  /*
    if (mod && typeof mod.registerRocketChat === 'function') {
      mod.registerRocketChat({ baseUrl, token: rc.token || process.env.ROCKETCHAT_TOKEN, userId: rc.userId })
      if (process.env.NODE_ENV !== 'production') console.debug('[rocketchat] adapter registered')
    }
  */
  } catch (e) {
    // adapter not installed or failed to load; skip silently
    if (process.env.NODE_ENV !== 'production') console.debug('[rocketchat] adapter not registered', e)
  }
})
