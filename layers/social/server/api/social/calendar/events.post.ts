import { createDirectus, rest, staticToken, createItem } from '@directus/sdk'
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
  const body = await readBody(event)

  // Force ownership from the session — never trust a client-supplied `user`.
  return directus.request(
    createItem('social_calendar_events' as any, {
      ...Object.fromEntries(
        Object.entries((body ?? {}) as Record<string, unknown>).filter(([key, value]) =>
          EDITABLE.has(key) && (value === null || ['string', 'number', 'boolean'].includes(typeof value))),
      ),
      user: user.id,
    }),
  )
})
