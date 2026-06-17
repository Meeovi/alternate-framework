import { prisma } from '../../db'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const { messageId, type } = await readValidatedBody(event, z.object({
    messageId: z.string(),
    type: z.enum(['edit', 'regenerate'])
  }).parse)

  const chat = await prisma.chats.findFirst({
    where: {
      id: id as string,
      userId: session.user?.id || session.id as string
    }
  })

  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  const allMessages = await prisma.messages.findMany({
    where: { chatId: id as string },
    select: { id: true, role: true },
    orderBy: { createdAt: 'asc' }
  })

  const targetIndex = allMessages.findIndex(m => m.id === messageId)
  if (targetIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Message not found' })
  }

  const targetRole = allMessages[targetIndex].role
  if (type === 'edit' && targetRole !== 'user') {
    throw createError({ statusCode: 400, statusMessage: 'Can only edit user messages' })
  }
  if (type === 'regenerate' && targetRole !== 'assistant') {
    throw createError({ statusCode: 400, statusMessage: 'Can only regenerate assistant messages' })
  }

  const startIndex = type === 'edit' ? targetIndex + 1 : targetIndex
  const idsToDelete = allMessages.slice(startIndex).map(m => m.id)

  if (idsToDelete.length > 0) {
    await prisma.messages.deleteMany({
      where: { id: { in: idsToDelete } }
    })
  }

  return { success: true }
})
