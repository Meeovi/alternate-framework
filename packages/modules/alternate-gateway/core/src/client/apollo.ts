import apolloClientPkg from '@apollo/client'
import type {
  ApolloClient as ApolloClientType,
  NormalizedCacheObject,
} from '@apollo/client/core'
import fetch from 'cross-fetch'

const { ApolloClient, InMemoryCache, HttpLink } = apolloClientPkg as {
  ApolloClient: new (...args: any[]) => ApolloClientType<NormalizedCacheObject>
  InMemoryCache: new (...args: any[]) => any
  HttpLink: new (...args: any[]) => any
}

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
