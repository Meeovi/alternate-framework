import { getMesh } from '@graphql-mesh/runtime'
import type { MFrameworkComposeConfig } from '../../config/types'
import type { MFrameworkPlugin } from '../../plugins/definePlugin'
import { buildMeshConfig } from './buildMeshConfig'

export async function createMeshGateway(
  composeConfig: MFrameworkComposeConfig,
  plugins: MFrameworkPlugin[]
) {
  const meshConfig = buildMeshConfig(composeConfig, plugins)
  const mesh = await getMesh(meshConfig)

  return mesh
}
