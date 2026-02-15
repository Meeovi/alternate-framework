// src/plugins/adapter.client.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { registerAdapter } from '../lib/sdk'
import { createAdapter } from '../lib/adapter-loader'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  // Only create server-side to avoid requiring server-only adapter packages in the client bundle.
  // The server-provided `meeoviAdapter` will be serialized and available on the client via Nuxt's `provide`.
  if (process.server) {
    const adapter = await createAdapter(config)
    // log on server to make adapter creation visible in server runtime logs
    // eslint-disable-next-line no-console
    console.info('[starter] Meeovi adapter created (server):', adapter?.constructor?.name || 'adapter')
    registerAdapter(adapter)

    return {
      provide: {
        meeoviAdapter: adapter
      },
      hooks: {
        'app:mounted'() {
          // eslint-disable-next-line no-console
          console.info('[starter] Meeovi adapter registered:', adapter?.constructor?.name || 'adapter')
        }
      }
    }
  }

  // On client-side do nothing — the server will provide `meeoviAdapter` during SSR hydration.
  return {}
})