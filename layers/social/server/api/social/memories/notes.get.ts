import { createDirectus, rest, staticToken, readItems } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'
import { resolveToday } from '#social/server/utils/birthdays'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

const FIELDS = ['id', 'slug', 'title', 'summary', 'content', 'image', 'image_url', 'status', 'date_created', 'creator_id', 'username', 'user_avatar']
/** How many of the member's notes are scanned for "on this day". */
const SCAN = 500

// GET /api/social/memories/notes?today=YYYY-MM-DD — the signed-in member's
// own notes (Memories): `recent` (newest first) and `onThisDay`, notes
// written on today's day and month in earlier years. `today` is the
// browser's date so "today" follows the member's time zone.
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const today = resolveToday(getQuery(event).today)
  try {
    const rows = await directus.request(readItems('posts', {
      fields: FIELDS,
      filter: { creator_id: { _eq: user.id }, status: { _nin: ['archived', 'deleted', 'trash'] } },
      sort: ['-date_created'],
      limit: SCAN,
    })) as Array<Record<string, any>>

    const onThisDay = rows.filter((row) => {
      const created = new Date(String(row.date_created ?? ''))
      if (Number.isNaN(created.getTime())) return false
      return created.getUTCMonth() === today.getUTCMonth()
        && created.getUTCDate() === today.getUTCDate()
        && created.getUTCFullYear() < today.getUTCFullYear()
    })
    return { recent: rows.slice(0, 30), onThisDay }
  } catch (error) {
    console.error('[memories] notes read failed:', (error as Error)?.message ?? error)
    return { recent: [], onThisDay: [] }
  }
})
