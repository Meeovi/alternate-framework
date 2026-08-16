import { eq } from 'drizzle-orm'
import { requireAuth } from '#auth/server/utils/sessions'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'
import { findDirectRoom, createRoom } from '#social/server/utils/chat-store'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  let targetUserId = body?.targetUserId as string | undefined
  const targetEmail = body?.targetEmail as string | undefined

  if (!targetUserId && targetEmail) {
    const [found] = await db.select({ id: users.id }).from(users).where(eq(users.email, targetEmail)).limit(1)
    if (!found) {
      throw createError({ statusCode: 404, statusMessage: `No user found with email ${targetEmail}` })
    }
    targetUserId = found.id
  }

  if (!targetUserId) {
    throw createError({ statusCode: 400, statusMessage: 'targetUserId or targetEmail is required' })
  }
  if (targetUserId === user.id) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot start a conversation with yourself' })
  }

  const existing = findDirectRoom(user.id, targetUserId)
  const room = existing || createRoom([user.id, targetUserId])

  return { id: room.id }
})
