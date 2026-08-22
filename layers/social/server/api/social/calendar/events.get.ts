import { createDirectus, rest, staticToken, readItems } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'

// See layers/social/app/composables/calendar/useCalendar.ts for the
// social_calendar_events collection schema. That composable previously
// called $directus directly from the client using a static/admin token
// with no user filter at all — any authenticated user could read every
// other user's calendar. This route enforces the missing per-user scoping
// server-side; the client should call it via $fetch instead.
const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

const FIELDS = [
  'id',
  'text',
  'start_date',
  'end_date',
  'all_day',
  'rrule',
  'exdates',
  'calendar_id',
  'description',
  'status',
  'user',
]

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const start = query.start ? String(query.start) : undefined
  const end = query.end ? String(query.end) : undefined

  const now = new Date()
  const rangeStart = start ?? new Date(now.getFullYear() - 1, 0, 1).toISOString()
  const rangeEnd = end ?? new Date(now.getFullYear() + 2, 11, 31).toISOString()

  return directus.request(
    readItems('social_calendar_events' as any, {
      fields: FIELDS,
      sort: ['start_date'],
      limit: -1,
      filter: {
        user: { _eq: user.id },
        start_date: { _lte: rangeEnd },
        end_date: { _gte: rangeStart },
      },
    }),
  )
})
