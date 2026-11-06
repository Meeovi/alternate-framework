// GET /api/social/atproto/crosspost — whether the signed-in member's public
// notes are also posted to their Bluesky account (server/utils/crosspost.ts).
// { connected, handle, enabled, since }
import { eq, sql } from 'drizzle-orm'
import { requireAuth } from '#auth/server/utils/sessions'
import { db } from '#auth/server/utils/drizzle'
import { atprotoSessions, users } from '#auth/server/database/migrations/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const [row] = await db.select({
    handle: atprotoSessions.handle,
    setting: sql<{ enabled?: boolean, since?: string } | null>`${users.rawUserMetaData} -> 'blueskyCrosspost'`,
  }).from(users)
    .leftJoin(atprotoSessions, eq(atprotoSessions.userId, users.id))
    .where(eq(users.id, user.id)).limit(1)
  return {
    connected: !!row?.handle,
    handle: row?.handle ?? null,
    enabled: !!row?.handle && row?.setting?.enabled === true,
    since: row?.setting?.enabled ? row.setting.since ?? null : null,
  }
})
