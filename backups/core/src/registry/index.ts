import type {
  TransportAdapter,
  AuthAdapter,
  CommerceAdapter,
  SearchAdapter
} from '../adapters'

export interface SDKRegistry {
  transport: TransportAdapter
  auth?: AuthAdapter
  commerce?: CommerceAdapter
  search?: SearchAdapter
}

const registry: Partial<SDKRegistry> = {}

export const setTransport = (adapter: TransportAdapter) => {
  registry.transport = adapter
}

export const setAuthAdapter = (adapter: AuthAdapter) => {
  registry.auth = adapter
}

export const setCommerceAdapter = (adapter: CommerceAdapter) => {
  registry.commerce = adapter
}

export const setSearchAdapter = (adapter: SearchAdapter) => {
  registry.search = adapter
}

export const getRegistry = (): SDKRegistry => {
  if (!registry.transport) {
    throw new Error('Transport adapter not set')
  }
  return registry as SDKRegistry
}