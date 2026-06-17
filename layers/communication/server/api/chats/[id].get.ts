import { prisma } from '../db'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const chat = await prisma.chats.findFirst({
    where: {
      id: id as string,
      userId: session.user?.id || session.id as string
    },
    include: {
      messages: true
    }
  })

  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  const userId = session.user?.id || session.id
  const isOwner = chat.userId === userId

  if (chat.visibility === 'private' && !isOwner) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  const { userId: _, ...rest } = chat
  return { ...rest, isOwner }
})
