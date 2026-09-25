import { inArray } from 'drizzle-orm'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'

/**
 * Public avatar lookup for a batch of Meeovi user ids — used by the vibez
 * livebar to show each creator's picture. Only ever returns `users.image`
 * (a public Pixanomy link, already shown on profiles), never other fields.
 *
 *   GET /api/social/avatars?ids=<uuid>,<uuid>  →  { "<uuid>": "<url>" | null }
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default defineEventHandler(async (event) => {
  const raw = String(getQuery(event).ids || '')
  const ids = [...new Set(raw.split(',').map((s) => s.trim()).filter((s) => UUID.test(s)))].slice(0, 100)
  if (!ids.length) return {}

  const rows = await db
    .select({ id: users.id, image: users.image })
    .from(users)
    .where(inArray(users.id, ids))

  const result: Record<string, string | null> = Object.fromEntries(ids.map((id) => [id, null]))
  for (const row of rows) result[row.id] = row.image || null

  setResponseHeader(event, 'cache-control', 'public, max-age=60')
  return result
})
