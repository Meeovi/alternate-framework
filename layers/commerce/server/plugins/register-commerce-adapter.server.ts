/**
 * Commerce Adapter Registration Plugin
 *
 * Registers the commerce backend adapter with the mesh gateway at server startup.
 * Adapter resolution is centralized in server/adapters and currently targets Magento.
 */

import { registerAdapterEndpoint } from '@mframework/api-client/mesh'
import { getCommerceAdapterRegistration } from '../adapters'

export default defineNitroPlugin(() => {
  try {
    const registration = getCommerceAdapterRegistration()

    registerAdapterEndpoint(registration.endpoint, registration.metadata)

    const endpoint = process.env.MAGENTO_GRAPHQL_ENDPOINT ||
      process.env.COMMERCE_GRAPHQL_ENDPOINT ||
      process.env.MAPI_ENDPOINT

    console.info(`[commerce-adapter] Registered Magento adapter: ${endpoint || 'dynamic endpoint'}`)
  } catch (error) {
    console.error('[commerce-adapter] Failed to register:', error)
  }
})