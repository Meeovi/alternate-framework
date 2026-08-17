import { inArray } from 'drizzle-orm'
import { requireAuth } from '#auth/server/utils/sessions'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'
import { listRoomsForUser } from '#social/server/utils/chat-store'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (!user.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const rooms = listRoomsForUser(user.id)

  const otherUserIds = [...new Set(rooms.map((r) => r.memberIds.find((id) => id !== user.id)).filter(Boolean))] as string[]
  const otherUsers = otherUserIds.length
    ? await db.select({ id: users.id, name: users.name, username: users.username }).from(users).where(inArray(users.id, otherUserIds))
    : []
  const otherUserMap = new Map(otherUsers.map((u) => [u.id, u]))

  return {
    data: rooms.map((r) => {
      const otherId = r.memberIds.find((id) => id !== user.id)
      const other = otherId ? otherUserMap.get(otherId) : undefined
      return {
        id: r.id,
        otherUser: other ? { id: other.id, name: other.username || other.name } : null,
        createdAt: r.createdAt,
      }
    }),
  }
})
