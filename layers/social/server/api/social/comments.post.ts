import { createDirectus, rest, staticToken, createItem } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { targetType, targetId, content } = body as { targetType?: string; targetId?: string; content?: string }

  if (!targetType || !targetId || !content?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'targetType, targetId and content are required' })
  }

  const created = await directus.request(
    createItem('content_comments', {
      target_type: targetType,
      target_id: targetId,
      user_id: user.id,
      body: content.trim(),
    }),
  )

  return {
    id: (created as any).id,
    content: content.trim(),
    date_created: (created as any).created_at,
    username: (user as any).username || user.name || 'You',
  }
})
