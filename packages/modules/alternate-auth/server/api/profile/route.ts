import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../../utils/auth'
import { prisma } from 'alternate-gateway/core'

export default defineEventHandler(async (event) => {
  const method = (event.node.req.method || 'GET').toUpperCase()
  // Require auth for both read and write
  const user = await requireAuth(event)
  if (method === 'GET') {
    const profile = await prisma.users.findUnique({ where: { id: user.id as any } as any })
    return { profile }
  }

  if (method === 'PUT' || method === 'POST') {
    const body = await readBody(event)
    // Allow flexible updates from UI components; cast to any to avoid compile-time typing
    const updated = await prisma.users.update({ where: { id: user.id as any } as any, data: body as any })
    return { profile: updated }
  }

  return { status: 405 }
})
