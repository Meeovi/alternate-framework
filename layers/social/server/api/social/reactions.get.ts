import { createDirectus, rest, staticToken, readItems } from '@directus/sdk'
import { getAuthSession } from '#auth/server/utils/sessions'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const targetType = query.targetType as string | undefined
  const targetId = query.targetId as string | undefined
  const emoji = (query.emoji as string | undefined) || '❤️'

  if (!targetType || !targetId) {
    throw createError({ statusCode: 400, statusMessage: 'targetType and targetId are required' })
  }

  // Public read — a signed-out viewer still sees the like count, just no
  // "did I react" state.
  const session = await getAuthSession(event).catch(() => null)
  const userId = session?.user?.id as string | undefined

  const rows = await directus.request(
    readItems('content_reactions', {
      filter: {
        target_type: { _eq: targetType },
        target_id: { _eq: targetId },
        emoji: { _eq: emoji },
      },
      fields: ['user_id'],
      limit: -1,
    }),
  )

  const reactorIds = Array.isArray(rows) ? rows.map((r: any) => r.user_id) : []

  return {
    count: reactorIds.length,
    reacted: userId ? reactorIds.includes(userId) : false,
  }
})
