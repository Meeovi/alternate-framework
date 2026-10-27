import { requireAuth } from '#auth/server/utils/sessions'
import { cleanQuery, recordSearch } from '#social/server/utils/searchHistory'

// POST /api/social/search-history { q } — remembers a search for the
// signed-in member (the results page sends one per query it shows).
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody<{ q?: unknown }>(event).catch(() => null)
  const q = cleanQuery(body?.q)
  if (!q) throw createError({ statusCode: 400, statusMessage: 'Nothing to remember' })
  await recordSearch(user.id, q)
  return { ok: true }
})
