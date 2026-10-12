// Nitro plugin: registers the "atproto" network (../network.ts) in the social
// layer's federation registry.
import { defineNitroPlugin } from 'nitropack/runtime'
import { useRuntimeConfig } from '#imports'
import { getAtprotoServiceUrl } from '../client'
import { createAtprotoNetwork } from '../network'
import { FEDERATION_REGISTRY, type FederationNetwork } from '../federation'

const NETWORK = 'atproto'

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig() as Record<string, any>
  const service = config.public?.atproto?.service || getAtprotoServiceUrl()
  const configured = Boolean((config.atproto?.identifier || process.env.ATPROTO_IDENTIFIER) && (config.atproto?.appPassword || process.env.ATPROTO_APP_PASSWORD))
  const g = globalThis as Record<symbol, unknown>
  if (!(g[FEDERATION_REGISTRY] instanceof Map)) g[FEDERATION_REGISTRY] = new Map()
  ;(g[FEDERATION_REGISTRY] as Map<string, FederationNetwork>).set(NETWORK, createAtprotoNetwork({ service, configured }))
})
