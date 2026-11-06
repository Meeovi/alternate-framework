import { createDirectus, rest, staticToken, readItems } from '@directus/sdk'
import { getAuthSession } from '#auth/server/utils/sessions'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const targetType = query.targetType as string | undefined
  const targetId = query.targetId as string | undefined

  if (!targetId || !['user', 'space', 'outlet', 'note'].includes(targetType as string) || !/^[A-Za-z0-9_.:-]{1,128}$/.test(targetId)) {
    throw createError({ statusCode: 400, statusMessage: 'targetType and targetId are required' })
  }

  // Public read — a signed-out viewer just gets `following: false`.
  const session = await getAuthSession(event).catch(() => null)
  const userId = session?.user?.id as string | undefined

  if (!userId) {
    return { following: false }
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

  return { following: Array.isArray(existing) && existing.length > 0 }
})
