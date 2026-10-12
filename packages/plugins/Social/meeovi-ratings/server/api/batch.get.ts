import { defineEventHandler, getQuery } from 'h3'
import type { RatingsBatchResponse } from '../../runtime/types'
import { parseItems, ratingsUser, summaries } from '../utils/ratings'

/** GET {apiBase}?items=post:12,product:9 — average, count, and (signed in)
 *  your rating + whether you may rate, for up to 100 items at once. */
export default defineEventHandler(async (event): Promise<RatingsBatchResponse> => {
  const keys = parseItems(event, getQuery(event).items)
  const user = await ratingsUser(event)
  return { signedIn: Boolean(user), items: keys.length ? await summaries(event, keys, user?.id ?? null) : {} }
})
