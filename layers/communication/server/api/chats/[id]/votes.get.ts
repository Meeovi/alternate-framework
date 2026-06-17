import { prisma } from '../../db'
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
    }
  })

  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  return await prisma.votes.findMany({
    where: { chatId: id as string }
  })
})
