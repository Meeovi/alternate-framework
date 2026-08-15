import { inArray } from 'drizzle-orm'
import { createDirectus, rest, staticToken, readItems } from '@directus/sdk'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const targetType = query.targetType as string | undefined
  const targetId = query.targetId as string | undefined

  if (!targetType || !targetId) {
    throw createError({ statusCode: 400, statusMessage: 'targetType and targetId are required' })
  }

  const comments = await directus.request(
    readItems('content_comments', {
      filter: {
        target_type: { _eq: targetType },
        target_id: { _eq: targetId },
      },
      sort: ['-created_at'],
      limit: 100,
      fields: ['id', 'user_id', 'body', 'created_at'],
    }),
  )

  const list = Array.isArray(comments) ? comments : []
  const userIds = [...new Set(list.map((c: any) => c.user_id))]

  const userRows = userIds.length
    ? await db
        .select({ id: users.id, name: users.name, username: users.username })
        .from(users)
        .where(inArray(users.id, userIds))
    : []
  const userMap = new Map(userRows.map((u) => [u.id, u]))

  return {
    data: list.map((c: any) => ({
      id: c.id,
      content: c.body,
      date_created: c.created_at,
      username: userMap.get(c.user_id)?.username || userMap.get(c.user_id)?.name || 'Unknown',
    })),
  }
})
