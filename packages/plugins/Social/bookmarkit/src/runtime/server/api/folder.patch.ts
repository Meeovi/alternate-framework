import { defineEventHandler, readBody } from 'h3'
import { directus, readFolder, requireFolder, requireUser, routeId } from '../utils/bookmarks'

/** PATCH {apiBase}/folders/:id — { name?, description? } */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const folder = await requireFolder(event, user.id, routeId(event))
  const changes = readFolder(await readBody(event), true)
  if (!Object.keys(changes).length) return folder
  await directus(event)(`/items/lists/${folder.id}`, { method: 'PATCH', body: changes })
  return { ...folder, ...changes }
})
