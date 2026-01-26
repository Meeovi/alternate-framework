import { GraphQLClient } from 'graphql-request'
import { getSdk } from './sdk'

export interface MagentoClientOptions {
  endpoint: string
  accessToken?: string
  timeoutMs?: number
}

export function createMagentoClient(options: MagentoClientOptions) {
  const client = new GraphQLClient(options.endpoint, {
    headers: options.accessToken
      ? { Authorization: `Bearer ${options.accessToken}` }
      : {},
  })

  return getSdk(client)
}