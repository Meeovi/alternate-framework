// GET /api/social/federation/:network/thread?author=&key= — one note from
// the network (by its author's handle and the network's key for it) and its
// direct replies, for the note page (/connect/note/@<handle>/<key>).
import { createError, defineEventHandler, getQuery, getRouterParam } from 'h3'
import { federationError, requireCapability, useFederationNetwork } from '../../../../utils/federation'

export default defineEventHandler(async (event) => {
  const network = useFederationNetwork(getRouterParam(event, 'network') || '')
  const query = getQuery(event)
  const author = String(query.author ?? '').trim().replace(/^@/, '').slice(0, 253)
  const key = String(query.key ?? '').trim().slice(0, 512)
  if (!author || !key) throw createError({ statusCode: 400, statusMessage: 'Missing author or key' })
  const thread = requireCapability(network, 'thread')
  const found = await thread(author, key, { limit: 50 }).catch((e) => federationError(network, e))
  if (!found) throw createError({ statusCode: 404, statusMessage: 'Note not found' })
  return found
})
