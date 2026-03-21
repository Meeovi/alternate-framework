import type { GetMeshOptions } from '@graphql-mesh/runtime'
import type { MFrameworkComposeConfig } from '../../config/types'
import type { MFrameworkPlugin } from '../../plugins/definePlugin'

export function buildMeshConfig(
  composeConfig: MFrameworkComposeConfig,
  plugins: MFrameworkPlugin[]
): GetMeshOptions {
  const sources = [
    ...(composeConfig.subgraphs || []),
    ...plugins.flatMap(p => p.subgraphs || [])
  ]

  const transforms = [
    ...(composeConfig.transforms || []),
    ...plugins.flatMap(p => p.transforms || [])
  ]

  const additionalResolvers = [
    ...(composeConfig.additionalResolvers || []),
    ...plugins.flatMap(p => p.additionalResolvers || [])
  ]

  return {
    sources,
    transforms,
    additionalResolvers
  }
}
