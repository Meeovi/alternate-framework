import { createDirectus, rest, staticToken } from '@directus/sdk'
import type { RestCommand } from '@directus/sdk'
import { useRuntimeConfig } from '#imports'
import { CommerceBackendRegistry } from 'alternate-sdk'

// Mirrors app/plugins/directus.ts's routing rules, for the server/api
// files that construct their own inline Directus client instead of going
// through the Nuxt plugin (Nitro handlers don't share the app's plugin
// context). GET-only — writes always go to real Directus, see the plugin
// file for the full rationale. departments/categories are deliberately
// excluded — see app/plugins/directus.ts's comment on the same constant.
const IN_SCOPE_COLLECTIONS = new Set(['products', 'orders'])

export function getDirectusFacade() {
  const config = useRuntimeConfig()
  const realDirectus = createDirectus(process.env.DIRECTUS_URL!)
    .with(rest())
    .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))
  const activeBackendName = (config.public as any).commerceBackend || 'directus'

  return {
    ...realDirectus,
    async request<Output>(getOptions: RestCommand<Output, any>): Promise<Output> {
      const options = getOptions()
      const match = activeBackendName !== 'directus'
        ? options.path.match(/^\/items\/([^/]+)(?:\/(.+))?$/)
        : null
      const collection = match?.[1]

      if (options.method === 'GET' && collection && IN_SCOPE_COLLECTIONS.has(collection)) {
        const adapter = CommerceBackendRegistry.get(activeBackendName)
        if (adapter?.collections.includes(collection)) {
          return adapter.request({ method: 'GET', collection, key: match?.[2], params: options.params })
        }
      }
      return realDirectus.request(getOptions)
    },
  }
}
