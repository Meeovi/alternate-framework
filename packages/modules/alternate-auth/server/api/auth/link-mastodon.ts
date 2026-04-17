import { defineEventHandler, readBody } from 'h3'
import { prisma } from 'alternate-gateway/core'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  const { account } = body || {}
  if (!account || !account.id) {
    event.node.res.statusCode = 400
    return { error: 'missing account.id' }
  }

  try {
    const id = String(account.id)
    const user = await prisma.users.upsert({
      where: { id },
      update: { raw_user_meta_data: account, updated_at: new Date() } as any,
      create: { id, raw_user_meta_data: account, created_at: new Date() } as any,
    } as any)

    return { user }
  } catch (err: any) {
    event.node.res.statusCode = 500
    return { error: String(err?.message || err) }
  }
})
