import { and, eq, isNull, or } from 'drizzle-orm'
import { createError, defineEventHandler, getRouterParam } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** GET /api/social/members/:id — one member's public profile fields. */
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const id = String(getRouterParam(event, 'id') ?? '')
  if (!UUID.test(id)) throw createError({ statusCode: 404, statusMessage: 'Member not found' })
  const [member] = await db
    .select({ id: users.id, name: users.name, username: users.username, image: users.image })
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt), or(isNull(users.authBanned), eq(users.authBanned, false))))
    .limit(1)
  if (!member) throw createError({ statusCode: 404, statusMessage: 'Member not found' })
  return member
})
