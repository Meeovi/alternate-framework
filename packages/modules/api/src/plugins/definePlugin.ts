import type { MeshTransform, YamlConfig } from '@graphql-mesh/types'
import type { MFrameworkContext } from '../runtime/context/types'

export interface MFrameworkPlugin {
  name: string
  subgraphs?: YamlConfig.Source[]
  transforms?: MeshTransform[]
  additionalResolvers?: YamlConfig.AdditionalStitchingResolver[]
  extendContext?: (ctx: MFrameworkContext) => Promise<MFrameworkContext> | MFrameworkContext
}

export const definePlugin = (plugin: MFrameworkPlugin): MFrameworkPlugin => plugin
