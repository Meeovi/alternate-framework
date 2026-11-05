// GET /api/social/federation/:network/list?id= — a public list from the
// network (a Bluesky list of accounts) with its items, for its page on
// Meeovi (/lists/list/<network>:<id>). Its `url` is the original, shown
// there as the source.
import { createError, defineEventHandler, getQuery, getRouterParam } from 'h3'
import { federationError, requireCapability, useFederationNetwork } from '../../../../utils/federation'

export default defineEventHandler(async (event) => {
  const network = useFederationNetwork(getRouterParam(event, 'network') || '')
  const id = String(getQuery(event).id ?? '').trim().slice(0, 512)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  const list = requireCapability(network, 'list')
  const found = await list(id, { limit: 100 }).catch((e) => federationError(network, e))
  if (!found) throw createError({ statusCode: 404, statusMessage: 'List not found' })
  return found
})
