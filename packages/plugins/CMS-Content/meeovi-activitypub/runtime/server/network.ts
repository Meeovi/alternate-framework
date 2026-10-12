// Nitro plugin: registers the "activitypub" network (../network.ts) in the social
// layer's federation registry.
import { defineNitroPlugin } from 'nitropack/runtime'
import { useRuntimeConfig } from '#imports'
import { createActivitypubNetwork } from '../network'
import { FEDERATION_REGISTRY, type FederationNetwork } from '../federation'

const NETWORK = 'activitypub'

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig() as Record<string, any>
  const network = createActivitypubNetwork({
    server: config.public?.activitypub?.server,
    accessToken: config.meeoviActivitypub?.accessToken,
  })
  const g = globalThis as Record<symbol, unknown>
  if (!(g[FEDERATION_REGISTRY] instanceof Map)) g[FEDERATION_REGISTRY] = new Map()
  ;(g[FEDERATION_REGISTRY] as Map<string, FederationNetwork>).set(NETWORK, network)
})
