import { createDirectus, rest, staticToken, readItems } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'
import { triggerNovuWorkflow } from '#shared/server/utils/novu'

type ContentType = 'post' | 'short'

const CONTENT_LABEL: Record<ContentType, string> = {
  post: 'a new post',
  short: 'a new vibe',
}

// `follows` is still Directus (who-follows-whom, unrelated to how the
// notification itself gets delivered) — same flat target_id/target_type
// pair as follow.post.ts's notifyNewFollower; see that file's comment for
// why it isn't a real Directus relation.
const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const { contentType, itemId } = body as { contentType?: ContentType; itemId?: string | number }

  if (!contentType || !['post', 'short'].includes(contentType)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload parameters' })
  }

  const followers = await directus.request(
    readItems('follows', {
      filter: {
        target_id: { _eq: user.id },
        target_type: { _eq: 'user' },
      },
      fields: ['follower_id'],
      limit: -1,
    }),
  )

  const followerIds = Array.isArray(followers)
    ? [...new Set(followers.map((f: any) => f.follower_id).filter(Boolean))]
    : []

  if (followerIds.length === 0) {
    return { notified: 0 }
  }

  const authorName = user.name || user.email || 'Someone you follow'
  const label = CONTENT_LABEL[contentType]

  // Novu's trigger `to` accepts an array of subscriber ids directly, so the
  // whole fan-out (previously one Directus createItem per follower via
  // Promise.allSettled) is a single call — Novu handles delivering it to
  // each subscriber, and triggerNovuWorkflow is already best-effort.
  await triggerNovuWorkflow('new-content', {
    to: followerIds as string[],
    payload: {
      subject: 'New activity',
      actorId: user.id,
      actorName,
      contentType,
      itemId: itemId ?? null,
      label,
    },
  })

  return { notified: followerIds.length }
})
