import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { CommerceBackendRegistry } from 'alternate-sdk'
import { anonymousCommerceClient, createMageosDirectusBackend, publicCommerceClient } from '../../shared/mageosViaDirectus'

/**
 * The app's half of server/plugins/mageos-via-directus.ts: the store's
 * catalogue through Directus, for product pages and departments. The Vue
 * renderer has its own copy of CommerceBackendRegistry (the Nitro plugin's
 * registration isn't visible to it), so it registers here too — public
 * routes only, no token: directly against Directus while rendering on the
 * server, through the same-origin /api/cms proxy in the browser.
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public as Record<string, any>
  if (config.magento?.via !== 'directus' || CommerceBackendRegistry.get('magento')) return
  if (import.meta.server && !config.directus?.url) return

  const client = import.meta.server
    ? anonymousCommerceClient(String(config.directus.url).replace(/\/+$/, ''))
    : publicCommerceClient(window.location.origin)
  CommerceBackendRegistry.register(createMageosDirectusBackend(client, { trusted: false }))
})
