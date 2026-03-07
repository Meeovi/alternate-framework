import { YamlConfig } from '@graphql-mesh/types'

export function loadDatabaseSubgraph(
  name: string,
  options: {
    connectionString: string
    schema: string
  }
): YamlConfig.Source {
  return {
    name,
    handler: {
      prisma: {
        connectionString: options.connectionString,
        schema: options.schema
      }
    }
  }
}
