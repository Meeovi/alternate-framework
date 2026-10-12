// GET /api/social/federation — installed networks, what each can do, and
// whether its service is reachable right now.
import { defineEventHandler } from 'h3'
import { federationCapabilities, federationNetworks } from '../../../utils/federation'
import type { FederationStatus } from '../../../../shared/types/federation'

const STATUS_TIMEOUT_MS = 8000

export default defineEventHandler(async () => {
  const networks = await Promise.all(federationNetworks().map(async (network) => {
    let status: FederationStatus
    try {
      status = await Promise.race([
        network.status(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timed out')), STATUS_TIMEOUT_MS)),
      ])
    } catch (e) {
      status = { configured: false, connected: false, service: '', detail: (e as Error)?.message || 'unavailable' }
    }
    return { id: network.id, label: network.label, capabilities: federationCapabilities(network), status }
  }))
  return { networks }
})
