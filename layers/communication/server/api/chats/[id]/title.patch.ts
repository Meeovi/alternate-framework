import { prisma } from '../../db'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const { title } = await readValidatedBody(event, z.object({
    title: z.string().trim().min(1).max(100)
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

  const updated = await prisma.chats.update({
    where: { id: id as string },
    data: { title }
  })

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  return updated
})
