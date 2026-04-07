/**
 * Adapter auto-registration plugin.
 *
 * Runs on server to create the active adapter from runtime config and provides
 * it to the Nuxt app for SSR hydration.
 */
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { registerAdapter } from '../lib/sdk'
import { createAdapter } from '../lib/adapter-loader'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()

  if (process.server) {
    const adapter = await createAdapter(config)
    // eslint-disable-next-line no-console
    console.info('[shared] MeeoviAdapter created (server):', adapter?.constructor?.name ?? 'adapter')
    registerAdapter(adapter)

    return {
      provide: {
        meeoviAdapter: adapter,
      },
      hooks: {
        'app:mounted'() {
          // eslint-disable-next-line no-console
          console.info('[shared] MeeoviAdapter mounted:', adapter?.constructor?.name ?? 'adapter')
        },
      },
    }
  }

  return {}
})
