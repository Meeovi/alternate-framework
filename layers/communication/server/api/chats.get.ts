import { prisma } from '../db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId = session.user?.id || session.id

  return await prisma.chats.findMany({
    where: { userId: userId as string },
    orderBy: { createdAt: 'desc' }
  })
})
