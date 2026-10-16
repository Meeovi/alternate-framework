import { createDirectus, rest, staticToken, readItems, updateItem } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

// Only these plain columns, with plain values: the request body goes to
// Directus with the static token, so an object in a relational field would
// be a nested write into another collection (and `user` is set from the
// session, never from the body).
const EDITABLE = new Set(['text', 'start_date', 'end_date', 'all_day', 'rrule', 'exdates', 'calendar_id', 'description', 'status'])

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const owned = await directus.request(
    readItems('social_calendar_events' as any, {
      fields: ['id'],
      filter: { id: { _eq: id }, user: { _eq: user.id } },
      limit: 1,
    }),
  )
  if (!(owned as any[]).length) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  // Strip any client-supplied `user`/`id` — ownership is fixed, not editable.
  const safeBody = Object.fromEntries(
    Object.entries((body ?? {}) as Record<string, unknown>).filter(([key, value]) =>
      EDITABLE.has(key) && (value === null || ['string', 'number', 'boolean'].includes(typeof value))),
  )

  return directus.request(updateItem('social_calendar_events' as any, id!, safeBody))
})
