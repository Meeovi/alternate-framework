import { blob } from 'hub:blob'
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
    }
  })

  if (!chat) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chat not found'
    })
  }

  const username = session.user?.username || session.id
  const chatFolder = `${username}/${id}`

  try {
    const { blobs } = await blob.list({
      prefix: chatFolder
    })

    if (blobs.length > 0) {
      await Promise.all(
        blobs.map(b =>
          blob.del(b.pathname).catch(error =>
            console.error('[delete-chat] Failed to delete file:', b.pathname, error)
          )
        )
      )
    }
  } catch (error) {
    console.error('Failed to list/delete chat files:', error)
  }

  return await prisma.chats.delete({
    where: {
      id: id as string
    }
  })
})
