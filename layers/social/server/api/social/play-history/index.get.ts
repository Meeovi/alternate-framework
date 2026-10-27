import { requireAuth } from '#auth/server/utils/sessions'
import { historyIds, readKind } from '#social/server/utils/playHistory'

// GET /api/social/play-history?kind=watch|listen — the signed-in user's most
// recently played item ids, newest first. Answers an empty list (and logs)
// if the history can't be read, so a page's rows just stay hidden.
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const kind = readKind(getQuery(event).kind)
  try {
    return { ids: await historyIds(user.id, kind) }
  } catch (error) {
    console.error('[play-history] read failed:', (error as Error)?.message ?? error)
    return { ids: [] }
  }
})
