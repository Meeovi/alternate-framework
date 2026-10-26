import { defineEventHandler, readBody } from 'h3'
import { readDescription, readId, readTitle, readUrl, requireBookmark, requireFolder, requireUser, routeId, saveBookmark } from '../utils/bookmarks'

/** PATCH {apiBase}/:id — change any of url, title, description, folderId. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const bookmark = await requireBookmark(event, user.id, routeId(event))
  const body = await readBody<Record<string, unknown>>(event) ?? {}

  const changes: Record<string, unknown> = {}
  if (body.url !== undefined) changes.link = readUrl(body.url)
  if (body.title !== undefined) changes.title = readTitle(body.title) || new URL(String(changes.link ?? bookmark.url)).hostname.replace(/^www\./, '')
  if (body.description !== undefined) changes.description = readDescription(body.description)
  if (body.folderId !== undefined) changes.list_id = (await requireFolder(event, user.id, readId(body.folderId))).id
  if (!Object.keys(changes).length) return bookmark
  return saveBookmark(event, bookmark.id, changes)
})
