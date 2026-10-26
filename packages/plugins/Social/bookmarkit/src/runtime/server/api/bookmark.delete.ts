import { defineEventHandler, setResponseStatus } from 'h3'
import { directus, requireBookmark, requireUser, routeId } from '../utils/bookmarks'

/** DELETE {apiBase}/:id */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const bookmark = await requireBookmark(event, user.id, routeId(event))
  await directus(event)(`/items/list_items/${bookmark.id}`, { method: 'DELETE' })
  setResponseStatus(event, 204)
  return null
})
