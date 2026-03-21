/**
 * Mesh Instance Management
 *
 * Lazy-initializes the mesh gateway at server startup and provides a singleton
 * instance for use throughout the commerce layer. The mesh is built with all
 * registered adapters (currently Magento).
 *
 * See: docs/mesh-architecture.md
 */

import type { MeshInstance } from '@graphql-mesh/runtime'
import { getMesh } from '@graphql-mesh/runtime'
import { buildComposeConfig } from '@mframework/api-client/mesh'

let meshInstance: Promise<MeshInstance> | null = null

/**
 * Get or initialize the mesh instance
 *
 * On first call, builds the mesh configuration using all registered adapters
 * and initializes the mesh gateway. Subsequent calls return the cached instance.
 *
 * @throws Error if mesh initialization fails
 */
export async function getMeshInstance(): Promise<MeshInstance> {
  if (meshInstance) {
    return meshInstance
  }

  meshInstance = (async () => {
    try {
      const composeConfig = await buildComposeConfig()

      if (!composeConfig || !composeConfig.subgraphs || composeConfig.subgraphs.length === 0) {
        throw new Error(
          'No mesh subgraphs configured. Ensure at least one adapter (Magento) is registered via environment variables.'
        )
      }

      console.info('[meshInstance] Building mesh with', composeConfig.subgraphs.length, 'subgraph(s)')

      const mesh = await getMesh(composeConfig as any)

      console.info('[meshInstance] Mesh initialized successfully')

      return mesh
    } catch (error) {
      meshInstance = null
      throw new Error(`Failed to initialize mesh: ${error instanceof Error ? error.message : String(error)}`)
    }
  })()

  return meshInstance
}

/**
 * Clear the mesh instance cache
 *
 * Useful for testing or when adapters need to be re-registered.
 */
export function clearMeshInstance(): void {
  meshInstance = null
}
