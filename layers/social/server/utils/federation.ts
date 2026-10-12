// Federation registry — the social layer's built-in federation core (it
// replaces @mframework/adapter-federation). Network plugins add themselves
// to the FEDERATION_REGISTRY map from their own Nitro plugins; see
// shared/types/federation.ts for the contract.
import { createError } from 'h3'
import {
  FEDERATION_REGISTRY,
  type FederationCapability,
  type FederationNetwork,
} from '../../shared/types/federation'

function registry(): Map<string, FederationNetwork> {
  const g = globalThis as Record<symbol, unknown>
  if (!(g[FEDERATION_REGISTRY] instanceof Map)) g[FEDERATION_REGISTRY] = new Map<string, FederationNetwork>()
  return g[FEDERATION_REGISTRY] as Map<string, FederationNetwork>
}

export function registerFederationNetwork(network: FederationNetwork): void {
  registry().set(network.id, network)
}

/** Every installed network, in registration order. */
export function federationNetworks(): FederationNetwork[] {
  return [...registry().values()]
}

/** The network, or a 404 when no installed plugin provides it. */
export function useFederationNetwork(id: string): FederationNetwork {
  const network = registry().get(String(id || '').toLowerCase())
  if (!network) throw createError({ statusCode: 404, statusMessage: `No federation network "${id}" is installed` })
  return network
}

const CAPABILITIES: FederationCapability[] = ['profile', 'feed', 'searchPosts', 'publish']

export function federationCapabilities(network: FederationNetwork): FederationCapability[] {
  return CAPABILITIES.filter((c) => typeof network[c] === 'function')
}

/** The network method, or a 501 when this network doesn't support it. */
export function requireCapability<C extends FederationCapability>(network: FederationNetwork, capability: C): NonNullable<FederationNetwork[C]> {
  const fn = network[capability]
  if (typeof fn !== 'function') {
    throw createError({ statusCode: 501, statusMessage: `${network.label} doesn't support ${capability}` })
  }
  return fn.bind(network) as NonNullable<FederationNetwork[C]>
}

/** Turn a network/library error into a clean 502 (or keep an h3 error). */
export function federationError(network: FederationNetwork, error: unknown): never {
  const e = error as { statusCode?: number, statusMessage?: string, message?: string }
  if (e?.statusCode && e?.statusMessage) throw error
  console.error(`[federation:${network.id}]`, e?.message || error)
  throw createError({ statusCode: 502, statusMessage: `${network.label} is unavailable right now` })
}
