import { createDirectus, rest, staticToken, readItems } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

// social_calendar_groups are shared sidebar filter groups (no `user` field —
// not per-user data), so no ownership scoping is needed here, just auth.
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  try {
    return await directus.request(
      readItems('social_calendar_groups' as any, {
        fields: ['id', 'label', 'color', 'active'],
        limit: -1,
      }),
    )
  } catch {
    return []
  }
})
