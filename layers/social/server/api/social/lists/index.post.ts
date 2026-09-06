import { createDirectus, rest, staticToken, createItem } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const { name, type = 'basic', color, icon } = (body ?? {}) as {
    name: string
    type?: string
    color?: string
    icon?: string
  }

  if (!name || typeof name !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'name is required' })
  }

  // `lists.user` is an M2M alias (-> lists_directus_users, columns
  // list_id/user_id), not a plain scalar field — a bare `user: user.id`
  // silently writes nothing, leaving the list ownerless. Force ownership
  // from the session via the real nested-write shape — never trust a
  // client-supplied user.
  return directus.request(
    createItem('lists' as any, {
      name,
      type,
      color,
      icon,
      user: { create: [{ user_id: user.id }], update: [], delete: [] },
    }),
  )
})
