import { readItems, createItem } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'
import { savedItemId } from '#social/server/utils/listItemKinds'
import { directus, ensureWatchLaterList } from '#social/server/utils/watchLater'

// Saves a vibe to the user's Watch Later list, making the list on the first save.
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const shortId = savedItemId((await readBody(event))?.shortId)
  if (!shortId) throw createError({ statusCode: 400, statusMessage: 'shortId is required' })

  const [video] = await directus.request(readItems('shorts' as any, { fields: ['id'], filter: { id: { _eq: shortId } }, limit: 1 })) as any[]
  if (!video) throw createError({ statusCode: 404, statusMessage: 'Video not found' })

  const listId = await ensureWatchLaterList(user.id)
  const [existing] = await directus.request(readItems('lists_shorts' as any, {
    fields: ['id'], filter: { lists_id: { _eq: listId }, shorts_id: { _eq: shortId } }, limit: 1,
  })) as any[]
  if (!existing) await directus.request(createItem('lists_shorts' as any, { lists_id: listId, shorts_id: shortId }))
  return { listId, shortId }
})
