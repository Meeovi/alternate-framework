import { and, asc, eq, ilike, isNull, ne, or, sql } from 'drizzle-orm'
import { createError, defineEventHandler, getQuery } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'

/**
 * GET /api/social/members?q= — find members by name or username, e.g. to
 * start a private message. Signed-in only; returns public profile fields
 * (name, username, picture) and never the searcher themselves or deleted /
 * banned accounts.
 */
export default defineEventHandler(async (event) => {
  const me = await requireAuth(event)
  const q = String(getQuery(event).q ?? '').trim().slice(0, 64)
  if (q.length < 2) throw createError({ statusCode: 400, statusMessage: 'Type at least 2 characters' })
  const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`

  return db
    .select({ id: users.id, name: users.name, username: users.username, image: users.image })
    .from(users)
    .where(and(
      ne(users.id, String(me.id)),
      isNull(users.deletedAt),
      or(isNull(users.authBanned), eq(users.authBanned, false)),
      or(ilike(users.name, like), ilike(users.username, like), ilike(users.displayUsername, like)),
    ))
    // Names that start with the query first.
    .orderBy(sql`case when ${users.name} ilike ${`${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`} then 0 else 1 end`, asc(users.name))
    .limit(10)
})
