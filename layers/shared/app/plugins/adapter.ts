/**
 * Adapter auto-registration plugin.
 *
 * Runs on server to create the active adapter from runtime config and provides
 * it to the Nuxt app for SSR hydration.
 */
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { registerAdapter } from '../lib/sdk'
import { createAdapter } from '../lib/adapter-loader'

export default defineNuxtPlugin(async (nuxtApp) => {
  if ('$meeoviAdapter' in (nuxtApp as any)) {
    return {}
  }


  // DISABLED: Adapter initialization causing Vite invalidation loop in dev
  // Re-enable in production or when dynamic import issues are resolved
  if (process.server) {
    return {}
  }

  if (process.env.NODE_ENV === 'development') {
    return {}
  }

  const config = useRuntimeConfig()
  const adapter = await createAdapter(config)
  registerAdapter(adapter)

  return {
    provide: {
      meeoviAdapter: adapter,
    },
  }
})
