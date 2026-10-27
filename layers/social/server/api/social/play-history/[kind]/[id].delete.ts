import { requireAuth } from '#auth/server/utils/sessions'
import { forgetPlay, readItemId, readKind } from '#social/server/utils/playHistory'

// DELETE /api/social/play-history/:kind/:id — removes one item from the
// signed-in user's watch or listen history.
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const kind = readKind(getRouterParam(event, 'kind'))
  const id = readItemId(getRouterParam(event, 'id'))
  try {
    await forgetPlay(user.id, kind, id)
  } catch (error) {
    console.error('[play-history] remove failed:', (error as Error)?.message ?? error)
    throw createError({ statusCode: 503, statusMessage: 'Play history is unavailable' })
  }
  return { success: true }
})
