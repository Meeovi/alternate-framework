import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import type { RatingSummary } from '../../runtime/types'
import { checkItem, ratingsUser, setRating, summaries } from '../utils/ratings'

/** PUT {apiBase}/:type/:id { rating: 1–5 } — rate (or re-rate) an item. */
export default defineEventHandler(async (event): Promise<RatingSummary> => {
  const key = checkItem(event, getRouterParam(event, 'type'), getRouterParam(event, 'id'))
  const user = await ratingsUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to rate' })
  const body = await readBody<{ rating?: unknown }>(event).catch(() => null)
  const rating = Number(body?.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw createError({ statusCode: 400, statusMessage: 'Rating must be a whole number from 1 to 5' })
  }
  await setRating(event, user.id, key, rating)
  return (await summaries(event, [key], user.id))[`${key.type}:${key.id}`]!
})
