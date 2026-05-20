// packages/magento/runtime/composables/useMagento.ts
import { useNuxtApp } from '#imports'
import type { MagentoClient } from '../server/utils/client'

/**
 * useMagento()
 *
 * Returns the injected Magento client instance.
 * This client is created in runtime/plugin.ts and provides:
 * - REST client (products, categories, cart, customer)
 * - or GraphQL client (query executor)
 *
 * The returned client is fully typed via MagentoClient.
 */
export function useMagento() {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$magento as MagentoClient
}
