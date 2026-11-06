// PUT /api/social/atproto/crosspost — turn "Also post my notes to Bluesky"
// on or off. Body: { enabled: boolean }. Kept in
// users.raw_user_meta_data.blueskyCrosspost = { enabled, since }: notes
// written from `since` (when it was turned on) are posted.
import { z } from 'zod'
import { eq, sql } from 'drizzle-orm'
import { requireAuth } from '#auth/server/utils/sessions'
import { db } from '#auth/server/utils/drizzle'
import { atprotoSessions, users } from '#auth/server/database/migrations/schema'

const bodySchema = z.object({ enabled: z.boolean() })

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const parsed = bodySchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'enabled must be true or false' })
  const { enabled } = parsed.data

  const [connection] = await db.select({ handle: atprotoSessions.handle }).from(atprotoSessions).where(eq(atprotoSessions.userId, user.id)).limit(1)
  if (enabled && !connection) throw createError({ statusCode: 409, statusMessage: 'Connect your Bluesky account first' })

  // Each time it's turned on, posting starts from now: notes written while
  // it was off stay on Meeovi only.
  const since = new Date().toISOString()
  const value = enabled
    ? sql`jsonb_build_object('enabled', true, 'since', to_jsonb(${since}::text))`
    : sql`jsonb_build_object('enabled', false)`
  await db.update(users)
    .set({ rawUserMetaData: sql`jsonb_set(coalesce(${users.rawUserMetaData}, '{}'::jsonb), '{blueskyCrosspost}', ${value})` })
    .where(eq(users.id, user.id))
  return { connected: !!connection, handle: connection?.handle ?? null, enabled, since: enabled ? since : null }
})
