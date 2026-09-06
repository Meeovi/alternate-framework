import { createDirectus, rest, staticToken, readItems, deleteItems } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'
import { resolveListItemKind, normalizeId } from '#social/server/utils/listItemKinds'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { junctionCollection, itemIdColumn } = resolveListItemKind(body?.kind)

  if (!body?.listId || !body?.itemId) {
    throw createError({ statusCode: 400, statusMessage: 'listId and itemId are required' })
  }
  const listId = normalizeId(body.listId)
  const itemId = normalizeId(body.itemId)

  const owned = await directus.request(
    readItems('lists' as any, {
      fields: ['id'],
      filter: { id: { _eq: listId }, user: { user_id: { _eq: user.id } } },
      limit: 1,
    }),
  )
  if (!(owned as any[]).length) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  const junctionRows = await directus.request(
    readItems(junctionCollection as any, {
      fields: ['id'],
      filter: { lists_id: { _eq: listId }, [itemIdColumn]: { _eq: itemId } },
    }),
  )
  const ids = (junctionRows as any[]).map((row) => row.id)
  if (!ids.length) {
    return { success: true }
  }

  await directus.request(deleteItems(junctionCollection as any, ids))
  return { success: true }
})
