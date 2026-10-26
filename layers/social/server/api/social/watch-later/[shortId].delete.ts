import { readItems, deleteItems } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'
import { savedItemId } from '#social/server/utils/listItemKinds'
import { directus, watchLaterLists } from '#social/server/utils/watchLater'

// Removes a vibe from every one of the user's Watch Later lists.
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const shortId = savedItemId(getRouterParam(event, 'shortId'))
  if (!shortId) throw createError({ statusCode: 400, statusMessage: 'Invalid video id' })

  const lists = await watchLaterLists(user.id)
  if (!lists.length) return { success: true }
  const rows = await directus.request(readItems('lists_shorts' as any, {
    fields: ['id'], filter: { lists_id: { _in: lists.map((list) => list.id) }, shorts_id: { _eq: shortId } }, limit: -1,
  })) as Array<{ id: number }>
  if (rows.length) await directus.request(deleteItems('lists_shorts' as any, rows.map((row) => row.id)))
  return { success: true }
})
