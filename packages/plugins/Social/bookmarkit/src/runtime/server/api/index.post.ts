import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { createFolder, listFolders, readDescription, readId, readTitle, readUrl, requireFolder, requireUser, saveBookmark } from '../utils/bookmarks'

/** POST {apiBase} — { url, title?, description?, folderId? }. Without a folder it goes in the oldest one, made if needed. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<Record<string, unknown>>(event)
  const url = readUrl(body?.url)
  const title = readTitle(body?.title) || new URL(url).hostname.replace(/^www\./, '')
  const description = readDescription(body?.description)

  const folder = body?.folderId !== undefined && body?.folderId !== null
    ? await requireFolder(event, user.id, readId(body.folderId))
    : (await listFolders(event, user.id))[0] ?? await createFolder(event, user.id, {})

  setResponseStatus(event, 201)
  return saveBookmark(event, null, { title, link: url, description, list_id: folder.id })
})
