import { YamlConfig } from '@graphql-mesh/types'

export function loadOpenAPISubgraph(
  name: string,
  options: {
    source: string
    baseUrl?: string
    operationHeaders?: Record<string, string>
  }
): YamlConfig.Source {
  return {
    name,
    handler: {
      openapi: {
        source: options.source,
        baseUrl: options.baseUrl,
        operationHeaders: options.operationHeaders
      }
    }
  }
}
