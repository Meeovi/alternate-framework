import { YamlConfig } from '@graphql-mesh/types'

export function loadJSONSchemaSubgraph(
  name: string,
  options: {
    baseUrl: string
    operations: any[]
  }
): YamlConfig.Source {
  return {
    name,
    handler: {
      jsonSchema: {
        baseUrl: options.baseUrl,
        operations: options.operations
      }
    }
  }
}
