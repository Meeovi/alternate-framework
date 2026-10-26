import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { createFolder, readFolder, requireUser } from '../utils/bookmarks'

/** POST {apiBase}/folders — { name, description? } */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const input = readFolder(await readBody(event))
  setResponseStatus(event, 201)
  return createFolder(event, user.id, input)
})
