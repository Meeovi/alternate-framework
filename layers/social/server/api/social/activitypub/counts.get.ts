import { createError, defineEventHandler, getQuery } from 'h3'
import { interactionCounts, type ObjectType } from '../../../utils/activitypub/store'

/**
 * GET /api/social/activitypub/counts?type=note|product|vibe&id= — likes,
 * boosts and replies a Meeovi item got on the fediverse.
 */
const TYPES: ObjectType[] = ['note', 'product', 'vibe']

export default defineEventHandler(async (event) => {
  const { type, id } = getQuery(event)
  if (!TYPES.includes(String(type) as ObjectType) || !/^\d{1,18}$/.test(String(id ?? ''))) {
    throw createError({ statusCode: 400, statusMessage: 'Unknown item' })
  }
  return interactionCounts(String(type) as ObjectType, String(id))
})
