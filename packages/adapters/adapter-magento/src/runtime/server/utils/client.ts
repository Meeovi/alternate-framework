// packages/magento/src/runtime/server/utils/client.ts

import type { MagentoRuntimeConfig } from './types'
import { createMagentoRestClient } from './rest'
import { createMagentoGraphQLClient } from './graphql'

export function createMagentoClient(
  config: MagentoRuntimeConfig,
  event: any
) {
  if (config.provider === 'graphql') {
    return createMagentoGraphQLClient(config, event)
  }

  return createMagentoRestClient(config, event)
}

export type MagentoClient = ReturnType<typeof createMagentoClient>
