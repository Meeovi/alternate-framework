import { createError, defineEventHandler, readBody } from 'h3'
import { eq, sql } from 'drizzle-orm'
import { requireAuth } from '../../../utils/sessions'
import { db } from '../../../utils/drizzle'
import { users } from '../../../database/migrations/schema'
import { safeUrl } from '../../../utils/profileLinks'

/**
 * PUT /api/profiles/me/cover — set (or clear, with null) the signed-in
 * member's profile cover image. Body: { url: string | null }, the public
 * link /api/assets/upload returned (an https address).
 *
 * Kept in users.raw_user_meta_data.cover: a JSON column on the member's own
 * row that nothing else uses (left from Supabase auth), so no schema change.
 * GET /api/profiles/:slug returns it as `cover`.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody<{ url?: unknown }>(event).catch(() => null)
  const raw = body?.url
  let url: string | null = null
  if (raw !== null && raw !== undefined && raw !== '') {
    url = typeof raw === 'string' && raw.length <= 2048 ? safeUrl(raw) : null
    if (!url || !url.startsWith('https://')) throw createError({ statusCode: 400, statusMessage: 'The cover must be an https image link' })
  }

  await db.update(users)
    .set({
      rawUserMetaData: url
        ? sql`jsonb_set(coalesce(${users.rawUserMetaData}, '{}'::jsonb), '{cover}', to_jsonb(${url}::text))`
        : sql`coalesce(${users.rawUserMetaData}, '{}'::jsonb) - 'cover'`,
    })
    .where(eq(users.id, user.id))
  return { cover: url }
})
