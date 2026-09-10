import { createDirectus, rest, staticToken, readItems, createItem, deleteItem } from '@directus/sdk'
import { z } from 'zod'
import { requireAuth } from '#auth/server/utils/sessions'

const bodySchema = z.object({
  targetType: z.string().min(1).max(64),
  // Accept a string or number id from the client, always store/compare as string.
  targetId: z.union([z.string().min(1).max(255), z.number()]).transform(String),
  emoji: z.string().min(1).max(16).optional(),
})

// content_reactions: a new, purpose-built collection — flat
// target_type/target_id/user_id/emoji, no relation to directus_users
// (unlike the legacy reactions/reactions_shorts M2M chain, which relates
// to directus_users and would foreign-key-violate on a real better-auth
// user id, or emoji_reactions, a similarly-shaped pre-existing collection
// with an undocumented check constraint on target_type). Toggle semantics:
// POST again with the same (targetType, targetId, emoji) removes it.
//
// target_type is free-form so the same collection (and this endpoint, and
// the <LikeButton> component) backs likes on any kind of content —
// 'product', 'list', 'post', 'shorts', 'video', … — keyed by whatever id
// that content uses.
const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

async function countReactions(targetType: string, targetId: string, emoji: string) {
  const rows = await directus.request(
    readItems('content_reactions', {
      filter: {
        target_type: { _eq: targetType },
        target_id: { _eq: targetId },
        emoji: { _eq: emoji },
      },
      fields: ['id'],
      limit: -1,
    }),
  )
  return Array.isArray(rows) ? rows.length : 0
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'targetType and targetId are required' })
  }
  const { targetType, targetId } = parsed.data
  // Default to the heart so a plain like button can POST { targetType, targetId }.
  const emoji = parsed.data.emoji || '❤️'

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

  const alreadyReacted = Array.isArray(existing) && existing.length > 0

  if (alreadyReacted) {
    await directus.request(deleteItem('content_reactions', existing[0]!.id))
  } else {
    await directus.request(
      createItem('content_reactions', {
        user_id: user.id,
        target_type: targetType,
        target_id: targetId,
        emoji,
      }),
    )
  }

  return {
    reacted: !alreadyReacted,
    count: await countReactions(targetType, String(targetId), emoji),
  }
})
