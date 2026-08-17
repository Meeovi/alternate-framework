import { defineNitroPlugin } from 'nitropack/runtime'
import { useRuntimeConfig } from '#imports'
import { ContentAdapterRegistry } from 'alternate-sdk'
import { createDirectusContentAdapter } from '../content-adapter'

// Runs in Nitro, separate from runtime/plugin.ts (a universal Vue plugin) —
// same reasoning as adapter-magento's runtime/server/commerce-link.ts:
// layers/shared's server/api/content/* routes never execute Vue app
// plugins, so runtime/plugin.ts's own ContentAdapterRegistry registration
// (if any) would be invisible to them. This is the ONLY place the content
// adapter gets registered for those routes.
export default defineNitroPlugin(() => {
  const options = ((useRuntimeConfig() as any).public)?.directus || {}
  if (!options.url) return

  ContentAdapterRegistry.register('directus', createDirectusContentAdapter(options.url, options.auth?.token))
})
