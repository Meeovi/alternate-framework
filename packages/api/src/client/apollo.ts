import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import fetch from 'cross-fetch'

let client: ApolloClient | null = null

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
