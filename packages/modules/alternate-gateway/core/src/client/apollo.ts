import type {
  ApolloClient as ApolloClientType,
  NormalizedCacheObject,
} from '@apollo/client/core'
import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { HttpLink } from '@apollo/client/link/http'
import fetch from 'cross-fetch'

let client: ApolloClientType<NormalizedCacheObject> | null = null

export function createApolloClient(uri: string) {
  client = new ApolloClient({
    link: new HttpLink({ uri, fetch }),
    cache: new InMemoryCache()
  })

  return client
}

export function getApolloClient() {
  if (!client) {
    throw new Error('Apollo client not initialized. Call createApolloClient() first.')
  }
  return client
}
