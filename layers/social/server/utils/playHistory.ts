import { createDirectus, rest, staticToken, readItems, createItem, updateItem, deleteItems } from '@directus/sdk'

/**
 * Per-account play history for "Watch again" (vibes) and "Listen again"
 * (radio stations): Directus `play_history`, one row per user + item with
 * when it was last played (scripts/play-history-schema.mjs creates it).
 * Only these server routes touch it; the /api/cms proxy keeps it private,
 * and account deletion erases it (layers/auth eraseUserContent).
 */
export type PlayKind = 'watch' | 'listen'

/** Where each kind's items live. */
export const PLAY_KINDS: Record<PlayKind, string> = { watch: 'shorts', listen: 'radios' }
/** Rows kept per user and kind; older plays are dropped. */
export const KEEP = 50
/** How many the rows show. */
export const SHOW = 20

const ITEM_ID = /^[A-Za-z0-9_-]{1,64}$/

export const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export function readKind(raw: unknown): PlayKind {
  if (raw === 'watch' || raw === 'listen') return raw
  throw createError({ statusCode: 400, statusMessage: 'kind must be watch or listen' })
}

export function readItemId(raw: unknown): string {
  const id = String(raw ?? '')
  if (!ITEM_ID.test(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid item id' })
  return id
}

const own = (userId: string, kind: PlayKind) => ({ user_id: { _eq: userId }, kind: { _eq: kind } })

/** The user's most recently played item ids of a kind. */
export async function historyIds(userId: string, kind: PlayKind, limit = SHOW): Promise<string[]> {
  const rows = await directus.request(readItems('play_history' as any, {
    fields: ['item_id'], filter: own(userId, kind), sort: ['-played_at'], limit,
  })) as Array<{ item_id: string }>
  return rows.map((row) => String(row.item_id))
}

/** Records a play: the item moves to the front; only the newest KEEP are kept. Unknown items are refused. */
export async function recordPlay(userId: string, kind: PlayKind, itemId: string): Promise<void> {
  const [item] = await directus.request(readItems(PLAY_KINDS[kind] as any, { fields: ['id'], filter: { id: { _eq: itemId } }, limit: 1 })) as any[]
  if (!item) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const playedAt = new Date().toISOString()
  const [existing] = await directus.request(readItems('play_history' as any, {
    fields: ['id'], filter: { ...own(userId, kind), item_id: { _eq: itemId } }, limit: 1,
  })) as Array<{ id: number }>
  if (existing) await directus.request(updateItem('play_history' as any, existing.id, { played_at: playedAt }))
  else await directus.request(createItem('play_history' as any, { user_id: userId, kind, item_id: itemId, played_at: playedAt }))

  const older = await directus.request(readItems('play_history' as any, {
    fields: ['id'], filter: own(userId, kind), sort: ['-played_at'], offset: KEEP, limit: -1,
  })) as Array<{ id: number }>
  if (older.length) await directus.request(deleteItems('play_history' as any, older.map((row) => row.id)))
}

/** Removes an item from the user's history of a kind. */
export async function forgetPlay(userId: string, kind: PlayKind, itemId: string): Promise<void> {
  const rows = await directus.request(readItems('play_history' as any, {
    fields: ['id'], filter: { ...own(userId, kind), item_id: { _eq: itemId } }, limit: -1,
  })) as Array<{ id: number }>
  if (rows.length) await directus.request(deleteItems('play_history' as any, rows.map((row) => row.id)))
}
