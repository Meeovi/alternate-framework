import { createError, defineEventHandler, getRouterParam } from 'h3'
import type { CreatorRating } from '../../runtime/types'
import { creatorRating } from '../utils/ratings'

/** GET {apiBase}/creator/:userId — the creator's score, overall and per type. */
export default defineEventHandler(async (event): Promise<CreatorRating> => {
  const userId = getRouterParam(event, 'userId') ?? ''
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(userId)) throw createError({ statusCode: 400, statusMessage: 'Invalid user id' })
  return creatorRating(event, userId)
})
