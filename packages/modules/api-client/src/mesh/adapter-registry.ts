/**
 * Adapter Registry for Mesh Gateway Integration
 * 
 * Provides a unified way for adapters to expose their GraphQL endpoints
 * and metadata to the mesh gateway, enabling dynamic subgraph composition.
 * 
 * This maintains backend-agnostic architecture by abstracting away specific
 * backend implementations (Magento, Directus, etc.) while exposing their
 * capabilities through a standardized interface.
 */

export interface AdapterEndpointConfig {
  /** Unique identifier for the adapter (e.g., 'commerce', 'lists', 'social') */
  name: string
  
  /** GraphQL endpoint URL - can be dynamic (e.g., from env vars) */
  endpoint: string | (() => Promise<string>)
  
  /** REST endpoint URL (optional fallback) */
  restEndpoint?: string | (() => Promise<string>)
  
  /** Headers to forward with all requests to this endpoint */
  headers?: Record<string, string> | ((context: any) => Record<string, string>)
  
  /** Optional: Authorization header value or function */
  authorization?: string | ((context: any) => string | undefined)
  
  /** Whether this adapter is available/enabled */
  enabled?: boolean | (() => Promise<boolean>)
  
  /** REST API prefix for fallback (e.g., '/rest/v2') */
  restPrefix?: string
  
  /** Whether GraphQL is the primary transport (REST is fallback) */
  graphqlFirst?: boolean // defaults to true
}

export interface AdapterMetadata {
  /** Adapter name */
  name: string
  
  /** Backend system type (e.g., 'magento', 'directus', 'vendure') */
  backendType: string
  
  /** Adapter version */
  version: string
  
  /** List of supported operations/modules */
  modules: string[]
  
  /** Whether this adapter supports GraphQL */
  supportsGraphQL: boolean
  
  /** Whether this adapter supports REST */
  supportsREST: boolean
}

/**
 * Global registry of adapter endpoints
 * This is populated at server startup by each layer's initialization
 */
const adapterRegistry = new Map<string, AdapterEndpointConfig>()
const adapterMetadata = new Map<string, AdapterMetadata>()

/**
 * Register an adapter endpoint with the mesh gateway
 * 
 * @param config Adapter endpoint configuration
 * @param metadata Optional metadata about the adapter
 * 
 * @example
 * registerAdapterEndpoint({
 *   name: 'commerce',
 *   endpoint: () => process.env.MAGENTO_GRAPHQL_ENDPOINT!,
 *   restEndpoint: process.env.MAGENTO_REST_ENDPOINT,
 *   authorization: (context) => context.headers['authorization'],
 *   graphqlFirst: true
 * }, {
 *   name: 'commerce',
 *   backendType: 'magento',
 *   version: '2.4.6',
 *   modules: ['products', 'cart', 'orders'],
 *   supportsGraphQL: true,
 *   supportsREST: true
 * })
 */
export function registerAdapterEndpoint(
  config: AdapterEndpointConfig,
  metadata?: AdapterMetadata
): void {
  if (adapterRegistry.has(config.name)) {
    console.warn(`[AdapterRegistry] Adapter '${config.name}' already registered, overwriting`)
  }
  
  adapterRegistry.set(config.name, {
    ...config,
    graphqlFirst: config.graphqlFirst !== false,
    enabled: config.enabled ?? true
  })
  
  if (metadata) {
    adapterMetadata.set(config.name, metadata)
  }
}

/**
 * Get all registered adapter endpoints
 */
export function getAllAdapterEndpoints(): AdapterEndpointConfig[] {
  return Array.from(adapterRegistry.values())
}

/**
 * Get a specific adapter endpoint by name
 */
export function getAdapterEndpoint(name: string): AdapterEndpointConfig | undefined {
  return adapterRegistry.get(name)
}

/**
 * Get metadata for all registered adapters
 */
export function getAllAdapterMetadata(): AdapterMetadata[] {
  return Array.from(adapterMetadata.values())
}

/**
 * Get metadata for a specific adapter
 */
export function getAdapterMetadata(name: string): AdapterMetadata | undefined {
  return adapterMetadata.get(name)
}

/**
 * Resolve endpoint URL (handles dynamic endpoints)
 */
export async function resolveAdapterEndpoint(config: AdapterEndpointConfig): Promise<string> {
  if (typeof config.endpoint === 'function') {
    return config.endpoint()
  }
  return config.endpoint
}

/**
 * Resolve REST endpoint URL (handles dynamic endpoints)
 */
export async function resolveAdapterRestEndpoint(config: AdapterEndpointConfig): Promise<string | undefined> {
  if (!config.restEndpoint) return undefined
  if (typeof config.restEndpoint === 'function') {
    return config.restEndpoint()
  }
  return config.restEndpoint
}

/**
 * Resolve whether adapter is enabled
 */
export async function isAdapterEnabled(config: AdapterEndpointConfig): Promise<boolean> {
  if (config.enabled === false) return false
  if (typeof config.enabled === 'function') {
    return config.enabled()
  }
  return true
}

/**
 * Clear the adapter registry (useful for testing/restart scenarios)
 */
export function clearAdapterRegistry(): void {
  adapterRegistry.clear()
  adapterMetadata.clear()
}
