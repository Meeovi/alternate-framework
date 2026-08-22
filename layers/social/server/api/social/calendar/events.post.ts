import { createDirectus, rest, staticToken, createItem } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  // Force ownership from the session — never trust a client-supplied `user`.
  return directus.request(
    createItem('social_calendar_events' as any, {
      ...body,
      user: user.id,
    }),
  )
})
