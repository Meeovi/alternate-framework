import { prisma } from '../../db'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const { visibility } = await readValidatedBody(event, z.object({
    visibility: z.enum(['public', 'private'])
  }).parse)

  const updated = await prisma.chats.update({
    where: {
      id: id as string
    },
    data: {
      visibility
    }
  })

  return updated
})
