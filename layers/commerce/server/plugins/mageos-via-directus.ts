import { defineNitroPlugin } from 'nitropack/runtime'
import { useRuntimeConfig } from '#imports'
import { CommerceBackendRegistry, CommerceCustomerLinkRegistry } from 'alternate-sdk'
import {
  createMageosDirectusBackend,
  createMageosDirectusCustomerLink,
  createMageosDirectusIntegrationStore,
  trustedCommerceClient,
} from '../../shared/mageosViaDirectus'

const INTEGRATION_STORE_KEY = Symbol.for('mframework.integrations.store')

/**
 * With `public.magento.via: 'directus'` (the default), the Mage-OS store is
 * reached through Directus's /commerce/* extension with the app's static
 * token — in place of adapter-magento's own Nitro registrations
 * (commerce-link.ts), which stand down in that mode. Server routes and SSR
 * read CommerceBackendRegistry 'magento' from here.
 */
export default defineNitroPlugin(() => {
  const config = useRuntimeConfig() as Record<string, any>
  if (config.public?.magento?.via !== 'directus') return

  const url = String(config.public?.directus?.url || '').replace(/\/+$/, '')
  const token = String(config.directus?.token || '')
  if (!url || !token) {
    // Apps without a store (no Magento endpoint either) have nothing to warn about.
    if (config.public?.magento?.endpoint) {
      console.warn('[commerce] magento.via is "directus" but the Directus URL or static token is missing; the store is unavailable')
    }
    return
  }

  const client = trustedCommerceClient(url, token)
  CommerceBackendRegistry.register(createMageosDirectusBackend(client, { trusted: true }))
  CommerceCustomerLinkRegistry.register(createMageosDirectusCustomerLink(client))
  // Integrations are sold as store products (@mframework/meeovi-integrations).
  ;(globalThis as Record<symbol, unknown>)[INTEGRATION_STORE_KEY] = createMageosDirectusIntegrationStore(client)
})
