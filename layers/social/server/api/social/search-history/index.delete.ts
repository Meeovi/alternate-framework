import { requireAuth } from '#auth/server/utils/sessions'
import { cleanQuery, forgetSearches } from '#social/server/utils/searchHistory'

// DELETE /api/social/search-history?q=… — forgets one search; without `q`,
// clears the signed-in member's whole search history.
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  await forgetSearches(user.id, cleanQuery(getQuery(event).q))
  return { ok: true }
})
