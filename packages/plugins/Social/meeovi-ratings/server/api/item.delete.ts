import { createError, defineEventHandler, getRouterParam } from 'h3'
import type { RatingSummary } from '../../runtime/types'
import { checkItem, clearRating, ratingsUser, summaries } from '../utils/ratings'

/** DELETE {apiBase}/:type/:id — remove your rating. */
export default defineEventHandler(async (event): Promise<RatingSummary> => {
  const key = checkItem(event, getRouterParam(event, 'type'), getRouterParam(event, 'id'))
  const user = await ratingsUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to rate' })
  await clearRating(event, user.id, key)
  return (await summaries(event, [key], user.id))[`${key.type}:${key.id}`]!
})
