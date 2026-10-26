import { defineEventHandler } from 'h3'
import type { BookmarksResponse } from '../../types'
import { listBookmarks, listFolders, requireUser } from '../utils/bookmarks'

/** GET {apiBase} — the signed-in user's folders and bookmarks, newest first. */
export default defineEventHandler(async (event): Promise<BookmarksResponse> => {
  const user = await requireUser(event)
  const folders = await listFolders(event, user.id)
  const bookmarks = await listBookmarks(event, folders.map((f) => f.id))
  for (const folder of folders) folder.count = bookmarks.filter((b) => b.folderId === folder.id).length
  return { folders, bookmarks }
})
