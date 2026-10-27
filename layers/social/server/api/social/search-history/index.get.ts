import { getAuthSession } from '#auth/server/utils/sessions'
import { recentSearches } from '#social/server/utils/searchHistory'

// GET /api/social/search-history — the signed-in member's recent searches,
// newest first. Guests (and read failures) get an empty list, so the
// results page's "Recent searches" row just stays hidden.
export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)
  if (!session?.user?.id) return { queries: [] }
  try {
    return { queries: await recentSearches(session.user.id) }
  } catch (error) {
    console.error('[search-history] read failed:', (error as Error)?.message ?? error)
    return { queries: [] }
  }
})
