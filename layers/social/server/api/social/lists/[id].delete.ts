import { createDirectus, rest, staticToken, readItems, deleteItem } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const owned = await directus.request(
    readItems('lists' as any, {
      fields: ['id'],
      filter: { id: { _eq: id }, user: { _eq: user.id } },
      limit: 1,
    }),
  )
  if (!(owned as any[]).length) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  return directus.request(deleteItem('lists' as any, id!))
})
