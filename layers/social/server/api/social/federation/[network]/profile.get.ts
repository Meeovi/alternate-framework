// GET /api/social/federation/:network/profile?handle=
import { createError, defineEventHandler, getQuery, getRouterParam } from 'h3'
import { federationError, requireCapability, useFederationNetwork } from '../../../../utils/federation'

export default defineEventHandler(async (event) => {
  const network = useFederationNetwork(getRouterParam(event, 'network') || '')
  const handle = String(getQuery(event).handle ?? '').trim().replace(/^@/, '').slice(0, 253)
  if (!handle) throw createError({ statusCode: 400, statusMessage: 'Missing handle' })
  const profile = requireCapability(network, 'profile')
  const actor = await profile(handle).catch((e) => federationError(network, e))
  if (!actor) throw createError({ statusCode: 404, statusMessage: `No ${network.label} account "${handle}"` })
  return actor
})
