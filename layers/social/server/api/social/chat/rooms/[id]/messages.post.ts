import { requireAuth } from '#auth/server/utils/sessions'
import { getRoom, addMessage } from '#social/server/utils/chat-store'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (!user.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const roomId = getRouterParam(event, 'id')!

  const room = getRoom(roomId)
  if (!room || !room.memberIds.includes(user.id)) {
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })
  }

  const body = await readBody(event)
  const text = (body?.text as string | undefined)?.trim()
  if (!text) {
    throw createError({ statusCode: 400, statusMessage: 'text is required' })
  }

  const message = addMessage(roomId, user.id, (user as any).username || user.name, text)
  return message
})
