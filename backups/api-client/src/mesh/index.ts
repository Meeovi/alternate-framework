/**
 * Mesh Integration Module
 * 
 * Provides utilities for dynamic mesh gateway configuration through adapter registration.
 * This enables backend-agnostic architecture where the frontend only sees mesh endpoints
 * and backend implementations are abstracted through adapters.
 */

export {
  registerAdapterEndpoint,
  getAllAdapterEndpoints,
  getAdapterEndpoint,
  getAllAdapterMetadata,
  getAdapterMetadata,
  resolveAdapterEndpoint,
  resolveAdapterRestEndpoint,
  isAdapterEnabled,
  clearAdapterRegistry,
  type AdapterEndpointConfig,
  type AdapterMetadata
} from './adapter-registry'

export {
  buildGatewayConfig,
  buildComposeConfig,
  buildFallbackComposeConfig
} from './mesh-builder'
