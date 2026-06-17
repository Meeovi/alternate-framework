import { prisma } from '../../db'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const { messageId, isUpvoted } = await readValidatedBody(event, z.object({
    messageId: z.string(),
    isUpvoted: z.boolean().optional()
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

  const message = await prisma.messages.findFirst({
    where: {
      id: messageId,
      chatId: id as string
    }
  })

  if (!message) {
    throw createError({ statusCode: 404, statusMessage: 'Message not found' })
  }

  if (message.role !== 'assistant') {
    throw createError({ statusCode: 400, statusMessage: 'Can only vote on assistant messages' })
  }

  if (isUpvoted === undefined) {
    await prisma.votes.delete({
      where: {
        chatId_messageId: {
          chatId: id as string,
          messageId
        }
      }
    })
  } else {
    await prisma.votes.upsert({
      where: {
        chatId_messageId: {
          chatId: id as string,
          messageId
        }
      },
      create: {
        chatId: id as string,
        messageId,
        isUpvoted
      },
      update: {
        isUpvoted
      }
    })
  }

  return { chatId: id, messageId, isUpvoted }
})
