// GET /api/social/federation — installed networks, what each can do, and
// whether its service is reachable right now.
import { defineEventHandler } from 'h3'
import { federationCapabilities, federationNetworks, withNetworkTimeout } from '../../../utils/federation'
import type { FederationStatus } from '../../../../shared/types/federation'

export default defineEventHandler(async () => {
  const networks = await Promise.all(federationNetworks().map(async (network) => {
    let status: FederationStatus
    try {
      status = await withNetworkTimeout(network.status())
    } catch (e) {
      status = { configured: false, connected: false, service: '', detail: (e as Error)?.message || 'unavailable' }
    }
    return { id: network.id, label: network.label, capabilities: federationCapabilities(network), status }
  }))
  return { networks }
})
