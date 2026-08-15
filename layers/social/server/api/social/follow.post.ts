import { createDirectus, rest, staticToken, readItems, createItem, deleteItem } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'

// Directus's `follows` collection: follower_id (uuid) + target_id/target_type
// (added specifically for this — see follows.target_id/target_type, a flat
// cross-system reference rather than a real Directus relation, since the
// target is either a better-auth user id or a Directus spaces.id and
// neither maps onto directus_users). Toggle semantics match the real UI
// (FollowButton.vue -> stores/social.ts), which only ever POSTs here.
const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const userId = user.id
  const body = await readBody(event)

  const { targetId, targetType } = body as { targetId?: string; targetType?: 'user' | 'space' }

  if (!targetId || !['user', 'space'].includes(targetType as string)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload parameters' })
  }

  if (targetType === 'user' && targetId === userId) {
    throw createError({ statusCode: 400, statusMessage: 'You cannot follow yourself' })
  }

  const existing = await directus.request(
    readItems('follows', {
      filter: {
        follower_id: { _eq: userId },
        target_id: { _eq: targetId },
        target_type: { _eq: targetType },
      },
      fields: ['id'],
      limit: 1,
    }),
  )

  if (Array.isArray(existing) && existing.length > 0) {
    await directus.request(deleteItem('follows', existing[0]!.id))
    return { following: false, message: 'Successfully unfollowed' }
  }

  await directus.request(
    createItem('follows', {
      follower_id: userId,
      target_id: targetId,
      target_type: targetType,
    }),
  )

  // NOTE: This is where you trigger Better Notify to alert targetId if targetType === 'user'

  return { following: true, message: 'Successfully followed' }
})
