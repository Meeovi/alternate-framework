import type { UIMessage } from 'ai'
import { prisma } from '../db'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const { id, message } = await readValidatedBody(event, z.object({
    id: z.string(),
    message: z.custom<UIMessage>()
  }).parse)

  const chat = await prisma.chats.create({
    data: {
      id,
      title: '',
      userId: session.user?.id || session.id as string,
      visibility: 'private'
    }
  })

  if (!chat) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create chat' })
  }

  await prisma.messages.create({
    data: {
      id: message.id,
      chatId: chat.id,
      userId: session.user?.id || session.id as string,
      role: 'user',
      parts: message.parts
    }
  })

  return chat
})
