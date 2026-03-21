import type { MeshSource, MeshTransform, YamlConfig } from '@graphql-mesh/types'

export interface MFrameworkPluginRef {
  module: string
  options?: Record<string, any>
}

export interface MFrameworkComposeConfig {
  subgraphs?: MeshSource[]
  plugins?: MFrameworkPluginRef[]
  transforms?: MeshTransform[]
  additionalResolvers?: YamlConfig.AdditionalStitchingResolver[]
}

export interface MFrameworkGatewayConfig {
  webhooks?: boolean
  introspection?: boolean
  cache?: 'memory' | 'redis' | 'none'
  tracing?: boolean
  playground?: boolean
}
