import { createDirectus, rest, staticToken, readItems, createItem, deleteItem } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'

// content_reactions: a new, purpose-built collection — flat
// target_type/target_id/user_id/emoji, no relation to directus_users
// (unlike the legacy reactions/reactions_shorts M2M chain, which relates
// to directus_users and would foreign-key-violate on a real better-auth
// user id, or emoji_reactions, a similarly-shaped pre-existing collection
// with an undocumented check constraint on target_type). Toggle semantics:
// POST again with the same (targetType, targetId, emoji) removes it.
const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { targetType, targetId, emoji } = body as { targetType?: string; targetId?: string; emoji?: string }

  if (!targetType || !targetId || !emoji) {
    throw createError({ statusCode: 400, statusMessage: 'targetType, targetId and emoji are required' })
  }

  const existing = await directus.request(
    readItems('content_reactions', {
      filter: {
        user_id: { _eq: user.id },
        target_type: { _eq: targetType },
        target_id: { _eq: targetId },
        emoji: { _eq: emoji },
      },
      fields: ['id'],
      limit: 1,
    }),
  )

  if (Array.isArray(existing) && existing.length > 0) {
    await directus.request(deleteItem('content_reactions', existing[0]!.id))
    return { reacted: false }
  }

  await directus.request(
    createItem('content_reactions', {
      user_id: user.id,
      target_type: targetType,
      target_id: targetId,
      emoji,
    }),
  )
  return { reacted: true }
})
