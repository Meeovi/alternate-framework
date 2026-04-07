/**
 * Mesh Instance Manager
 * 
 * Lazily initializes and caches a Mesh instance that composes multiple
 * GraphQL sources (adapters) into a single unified schema. Configuration
 * is loaded from base YAML, environment-specific YAML, and active adapter.
 * 
 * Usage:
 *   const mesh = await getMeshInstance()
 *   const schema = mesh.schema
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { getMesh, type MeshInstance } from '@graphql-mesh/runtime'
import YAML from 'yaml'
import { getRuntimeConfig } from '../utils/env'
import { getAdapterConfig } from '../adapters'

let meshInstance: Promise<MeshInstance> | null = null

/**
 * Load and merge mesh configuration
 * 
 * Priority order:
 * 1. Base configuration (common to all environments)
 * 2. Environment-specific configuration (overrides base)
 * 3. Active adapter configuration (sources and transforms)
 */
async function buildMeshConfig(): Promise<any> {
  const basePath = join(process.cwd(), 'server/mesh/mesh.config.base.yaml')
  const baseConfig = YAML.parse(readFileSync(basePath, 'utf8')) as any

  const { env, adapter } = getRuntimeConfig()
  const envPath = join(
    process.cwd(),
    `server/mesh/mesh.config.${env}.yaml`
  )
  
  const envConfig = YAML.parse(readFileSync(envPath, 'utf8')) as any

  const adapterConfig = getAdapterConfig(adapter)
  const adapterYaml = YAML.parse(readFileSync(adapterConfig.configPath, 'utf8')) as any

  // Merge configurations with proper precedence
  return {
    ...baseConfig,
    ...envConfig,
    sources: adapterYaml.sources || [],
    transforms: [
      ...(baseConfig.transforms || []),
      ...(adapterYaml.transforms || [])
    ]
  }
}

/**
 * Get or initialize the Mesh instance
 * 
 * First call initializes; subsequent calls return cached instance.
 * Uses Promise-based lazy initialization to ensure single instance.
 */
export async function getMeshInstance(): Promise<MeshInstance> {
  if (!meshInstance) {
    meshInstance = (async () => {
      const config = await buildMeshConfig()
      return getMesh(config as any)
    })()
  }
  return meshInstance
}

/**
 * Reset mesh instance (useful for testing)
 */
export function resetMeshInstance(): void {
  meshInstance = null
}
