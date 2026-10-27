import { requireAuth } from '#auth/server/utils/sessions'
import { readItemId, readKind, recordPlay } from '#social/server/utils/playHistory'

// POST /api/social/play-history { kind, id } — records that the signed-in
// user played a vibe (watch) or a radio station (listen).
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const kind = readKind(body?.kind)
  const id = readItemId(body?.id)
  try {
    await recordPlay(user.id, kind, id)
  } catch (error) {
    if ((error as { statusCode?: number })?.statusCode === 404) throw error
    console.error('[play-history] record failed:', (error as Error)?.message ?? error)
    throw createError({ statusCode: 503, statusMessage: 'Play history is unavailable' })
  }
  return { recorded: true }
})
