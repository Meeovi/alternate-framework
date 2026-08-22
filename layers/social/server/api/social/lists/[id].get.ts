import { createDirectus, rest, staticToken, readItems } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const result = await directus.request(
    readItems('lists' as any, {
      filter: { id: { _eq: id }, user: { _eq: user.id } },
      limit: 1,
    }),
  )
  const list = (result as any[])[0]
  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }
  return list
})
