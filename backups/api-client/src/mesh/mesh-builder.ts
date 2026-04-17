/**
 * Mesh Configuration Builder
 *
 * Dynamically generates mesh gateway configuration by loading all registered
 * adapter endpoints and creating GraphQL subgraphs. This enables backend-agnostic
 * architecture where layers don't hardcode backend URLs.
 */

import { createRequire } from 'node:module'
import type { MeshComposeCLISubgraphConfig } from '@graphql-mesh/compose-cli'

type GatewayConfig = {
  webhooks?: boolean
  cache?: string
}

type ComposeConfig = {
  subgraphs: MeshComposeCLISubgraphConfig[]
}

import {
  getAllAdapterEndpoints,
  resolveAdapterEndpoint,
  resolveAdapterRestEndpoint,
  isAdapterEnabled
} from './adapter-registry'

const require = createRequire(import.meta.url)

/**
 * Build gateway configuration for the mesh
 */
export function buildGatewayConfig(): GatewayConfig {
  return {
    webhooks: true,
    cache: 'memory',
    // Add additional gateway settings as needed
  }
}

/**
 * Build compose configuration by dynamically loading adapter schemas
 * 
 * This function:
 * 1. Gets all registered adapters
 * 2. Resolves their endpoints
 * 3. Filters enabled adapters
 * 4. Creates subgraph entries for each
 * 5. Handles authorization context forwarding
 * 
 * @param context Optional request context (for auth forwarding)
 * @example
 * const composeConfig = await buildComposeConfig()
 * // Returns configuration with all registered adapter subgraphs
 */
export async function buildComposeConfig(context?: any): Promise<ComposeConfig> {
  const { loadGraphQLHTTPSubgraph } = await import('@graphql-mesh/compose-cli')
  
  const adapters = getAllAdapterEndpoints()
  const subgraphs: MeshComposeCLISubgraphConfig[] = []
  
  for (const adapter of adapters) {
    // Check if adapter is enabled
    const enabled = await isAdapterEnabled(adapter)
    if (!enabled) {
      console.info(`[MeshBuilder] Skipping disabled adapter: ${adapter.name}`)
      continue
    }
    
    try {
      // Resolve endpoint
      const endpoint = await resolveAdapterEndpoint(adapter)
      
      // Prepare operation headers
      const operationHeaders: Record<string, string> = {
        ...(adapter.headers && typeof adapter.headers === 'object' ? adapter.headers : {})
      }
      
      // Add authorization if provided
      if (adapter.authorization) {
        const authValue = typeof adapter.authorization === 'function'
          ? adapter.authorization(context)
          : adapter.authorization
        
        if (authValue) {
          operationHeaders['Authorization'] = authValue
        }
      } else if (context?.headers?.authorization) {
        // Forward client authorization by default
        operationHeaders['Authorization'] = context.headers['authorization']
      }
      
      // Create subgraph entry
      const subgraphConfig: any = {
        endpoint,
        operationHeaders
      }
      
      // Add REST endpoint metadata if available (for fallback mechanism)
      const restEndpoint = await resolveAdapterRestEndpoint(adapter)
      if (restEndpoint && adapter.restPrefix) {
        subgraphConfig.restEndpoint = restEndpoint
        subgraphConfig.restPrefix = adapter.restPrefix
      }
      
      const sourceHandler = loadGraphQLHTTPSubgraph(
        adapter.name,
        subgraphConfig
      )
      
      subgraphs.push({ sourceHandler })
      console.info(`[MeshBuilder] Added subgraph: ${adapter.name} -> ${endpoint}`)
    } catch (error) {
      console.error(
        `[MeshBuilder] Failed to add subgraph for adapter '${adapter.name}':`,
        error
      )
      // Continue with other adapters instead of failing completely
    }
  }
  
  if (subgraphs.length === 0) {
    console.warn('[MeshBuilder] No adapters loaded - mesh will have no subgraphs')
  }
  
  const { defineConfig } = await import('@graphql-mesh/compose-cli')
  
  return defineConfig({
    subgraphs
  })
}

/**
 * Static mesh configuration fallback (for backwards compatibility)
 * Only uses this if no adapters are registered
 */
export function buildFallbackComposeConfig(): ComposeConfig {
  const { defineConfig, loadGraphQLHTTPSubgraph } = require('@graphql-mesh/compose-cli')
  
  const endpoint = process.env.SEARCH_ENDPOINT || 
                   process.env.AUTH_ENDPOINT || 
                   process.env.MAPI_ENDPOINT ||
                   'http://localhost:4000/graphql'
  
  return defineConfig({
    subgraphs: [
      {
        sourceHandler: loadGraphQLHTTPSubgraph('DefaultGraphQL', {
          endpoint,
          operationHeaders: {
            Authorization: '{context.headers["authorization"]}'
          }
        })
      }
    ]
  })
}
