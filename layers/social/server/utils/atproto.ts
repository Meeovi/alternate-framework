// layers/social/server/utils/atproto.ts
//
// Resumes a local user's own AT Protocol session (persisted into
// atproto_sessions by the "atproto" better-auth plugin's
// onSessionEstablished hook — see layers/auth/shared/utils/plugins.ts) so
// server routes can post/like/follow/etc. against the PDS *as that user*,
// distinct from the shared service-account client
// (@mframework/adapter-federation's useAtprotoClient(), bootstrapped by its
// Nuxt module for read-only paths that don't act as anyone in particular).
import { eq } from 'drizzle-orm'
import { AtprotoClient } from '@mframework/adapter-federation/clients/atproto'
import { db } from '#auth/server/utils/drizzle'
import { atprotoSessions } from '#auth/server/database/migrations/schema'

/** Loads a local user's persisted atproto session and resumes it into a
 *  live AtprotoClient. A refreshed access/refresh token pair is written
 *  back automatically (AtpAgent's persistSession callback fires on
 *  refresh, same as on initial login) — callers don't need to do anything
 *  extra to keep the stored session current.
 *
 *  Returns null if this user has never signed in with atproto (no row in
 *  atproto_sessions) — callers should surface that as "connect your
 *  Bluesky account" rather than a generic error. */
export async function getAtprotoClientForUser(userId: string): Promise<AtprotoClient | null> {
  const [row] = await db.select().from(atprotoSessions).where(eq(atprotoSessions.userId, userId)).limit(1)
  if (!row) return null

  return AtprotoClient.create({
    serviceUrl: row.service,
    session: {
      did: row.did,
      handle: row.handle,
      accessJwt: row.accessJwt,
      refreshJwt: row.refreshJwt,
      // AtpSessionData requires `active` — true is correct here: a
      // deactivated/taken-down account would fail resumeSession's own
      // getSession call below with a real error anyway, so this is never
      // used to skip that check, just to satisfy the type.
      active: true,
    },
    onSessionChange: (_event, session) => {
      if (!session) return
      // Fire-and-forget: a route already has its resumed client and can
      // proceed immediately, this just keeps the stored tokens current for
      // next time. Errors are logged, not thrown — a failed re-persist
      // shouldn't fail the request that triggered the refresh.
      db.update(atprotoSessions)
        .set({ accessJwt: session.accessJwt, refreshJwt: session.refreshJwt, updatedAt: new Date() })
        .where(eq(atprotoSessions.userId, userId))
        .catch((error) => console.error('[atproto] failed to persist refreshed session for user', userId, error))
    },
  })
}

/** Same as getAtprotoClientForUser, but throws a 400 the frontend can
 *  render as "connect your Bluesky account" instead of returning null. */
export async function requireAtprotoClientForUser(userId: string): Promise<AtprotoClient> {
  const client = await getAtprotoClientForUser(userId)
  if (!client) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No AT Protocol account linked — sign in with atproto (POST /sign-in/atproto) first.',
    })
  }
  return client
}
