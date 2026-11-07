// Nitro plugin: registers the "ostatus" network (../network.ts) in the social
// layer's federation registry.
import { defineNitroPlugin } from 'nitropack/runtime'
import { createOstatusNetwork, NETWORK } from '../network'
import { FEDERATION_REGISTRY, type FederationNetwork } from '../federation'

export default defineNitroPlugin(() => {
  const g = globalThis as Record<symbol, unknown>
  if (!(g[FEDERATION_REGISTRY] instanceof Map)) g[FEDERATION_REGISTRY] = new Map()
  ;(g[FEDERATION_REGISTRY] as Map<string, FederationNetwork>).set(NETWORK, createOstatusNetwork())
})
