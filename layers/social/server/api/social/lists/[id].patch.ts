import { createDirectus, rest, staticToken, readItems, updateItem } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

// Only these plain columns, with plain values: the request body goes to
// Directus with the static token, so an object in a relational field would
// be a nested write into another collection (and `user` is set from the
// session, never from the body).
const EDITABLE = new Set(['name', 'description', 'image', 'type', 'status', 'favorite', 'priority', 'progress', 'slug', 'sort'])

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  // `lists.user` is an M2M alias (-> lists_directus_users, columns
  // list_id/user_id), not a plain scalar field — see lists/index.get.ts.
  const owned = await directus.request(
    readItems('lists' as any, {
      fields: ['id'],
      filter: { id: { _eq: id }, user: { user_id: { _eq: user.id } } },
      limit: 1,
    }),
  )
  if (!(owned as any[]).length) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  const safeBody = Object.fromEntries(
    Object.entries((body ?? {}) as Record<string, unknown>).filter(([key, value]) =>
      EDITABLE.has(key) && (value === null || ['string', 'number', 'boolean'].includes(typeof value))),
  )

  return directus.request(updateItem('lists' as any, id!, safeBody))
})
