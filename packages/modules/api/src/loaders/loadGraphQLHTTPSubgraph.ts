import { YamlConfig } from '@graphql-mesh/types'

interface GraphQLHTTPOptions {
  endpoint: string
  retry?: number
  timeout?: number
  operationHeaders?: Record<string, string>
}

export function loadGraphQLHTTPSubgraph(
  name: string,
  options: GraphQLHTTPOptions
): YamlConfig.Source {
  return {
    name,
    handler: {
      graphql: {
        endpoint: options.endpoint,
        operationHeaders: options.operationHeaders,
        timeout: options.timeout,
        retry: options.retry
      }
    }
  }
}
