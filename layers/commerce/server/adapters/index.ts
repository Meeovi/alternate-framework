import type { AdapterEndpointConfig, AdapterMetadata } from '@mframework/api-client/mesh'
import { getMagentoAdapterRegistration } from './magento/adapter.config'

export type CommerceAdapterId = 'magento'

export interface CommerceAdapterRegistration {
  endpoint: AdapterEndpointConfig
  metadata: AdapterMetadata
}

function resolveAdapterId(): CommerceAdapterId {
  const configured = (process.env.COMMERCE_BACKEND_TYPE || 'magento').toLowerCase()

  if (configured !== 'magento') {
    throw new Error(`Unsupported commerce adapter: ${configured}. Only "magento" is currently implemented in this layer.`)
  }

  return 'magento'
}

export function getCommerceAdapterRegistration(): CommerceAdapterRegistration {
  const adapterId = resolveAdapterId()

  if (adapterId === 'magento') {
    return getMagentoAdapterRegistration()
  }

  throw new Error(`Adapter not implemented: ${adapterId}`)
}
