import { defineEventHandler, setResponseStatus } from 'h3'
import { deleteFolder, requireFolder, requireUser, routeId } from '../utils/bookmarks'

/** DELETE {apiBase}/folders/:id — the folder and every bookmark in it. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const folder = await requireFolder(event, user.id, routeId(event))
  await deleteFolder(event, folder.id)
  setResponseStatus(event, 204)
  return null
})
