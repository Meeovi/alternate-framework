// GET /api/social/federation/:network/search?q=&limit=
import { createError, defineEventHandler, getQuery, getRouterParam } from 'h3'
import { federationError, requireCapability, useFederationNetwork } from '../../../../utils/federation'

export default defineEventHandler(async (event) => {
  const network = useFederationNetwork(getRouterParam(event, 'network') || '')
  const query = getQuery(event)
  const q = String(query.q ?? '').trim().slice(0, 200)
  if (!q) throw createError({ statusCode: 400, statusMessage: 'Missing search text (q)' })
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 40)
  const search = requireCapability(network, 'searchPosts')
  return { posts: await search(q, { limit }).catch((e) => federationError(network, e)) }
})
