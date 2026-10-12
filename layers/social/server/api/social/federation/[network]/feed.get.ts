// GET /api/social/federation/:network/feed?actor=&limit= — an account's posts.
import { createError, defineEventHandler, getQuery, getRouterParam } from 'h3'
import { federationError, requireCapability, useFederationNetwork } from '../../../../utils/federation'

export default defineEventHandler(async (event) => {
  const network = useFederationNetwork(getRouterParam(event, 'network') || '')
  const query = getQuery(event)
  const actor = String(query.actor ?? '').trim().replace(/^@/, '').slice(0, 253)
  if (!actor) throw createError({ statusCode: 400, statusMessage: 'Missing actor' })
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 40)
  const feed = requireCapability(network, 'feed')
  return { posts: await feed(actor, { limit }).catch((e) => federationError(network, e)) }
})
