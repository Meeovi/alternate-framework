import { requireAuth } from '#auth/server/utils/sessions'
import { getRoom, getMessages } from '#social/server/utils/chat-store'

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

  return { data: getMessages(roomId) }
})
