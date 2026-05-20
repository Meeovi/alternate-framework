import { createMagentoRestClient } from './rest'
import { createMagentoGraphQLClient } from './graphql'

export function createMagentoClient(config, event) {
  if (config.provider === 'graphql') {
    return createMagentoGraphQLClient(config, event)
  }
  return createMagentoRestClient(config, event)
}

export type MagentoClient = ReturnType<typeof createMagentoClient>
