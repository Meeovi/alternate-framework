import { createDirectus, rest, staticToken, readItems, updateItem } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

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
  const { user: _ignoredUser, id: _ignoredId, ...safeBody } = (body ?? {}) as Record<string, unknown>

  return directus.request(updateItem('social_calendar_events' as any, id!, safeBody))
})
