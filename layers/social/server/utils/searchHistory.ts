import { readItems, createItem, updateItem, deleteItems } from '@directus/sdk'
import { directus } from '#social/server/utils/playHistory'

/**
 * Per-account recent searches for the results page (layers/search
 * results.vue). Stored in Directus `play_history` as kind "search" with the
 * query in item_id: the same private, per-user history collection as
 * "Watch again" / "Listen again" (the /api/cms proxy keeps it private and
 * account deletion erases it), so no extra collection is needed.
 */
const KIND = 'search'
/** Searches kept per user; older ones are dropped. */
export const KEEP = 30
/** How many the results page shows. */
export const SHOW = 10
/** Longest query kept (item_id is varchar 255). */
export const MAX_QUERY = 200

/** A query worth remembering: trimmed, single-spaced, within MAX_QUERY; '' otherwise. */
export function cleanQuery(raw: unknown): string {
  return String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_QUERY)
}

const own = (userId: string) => ({ user_id: { _eq: userId }, kind: { _eq: KIND } })
/** Case-insensitive: "Shoes" and "shoes" are one entry. */
const sameQuery = (q: string) => ({ item_id: { _icontains: q } })

export async function recentSearches(userId: string, limit = SHOW): Promise<string[]> {
  const rows = await directus.request(readItems('play_history' as any, {
    fields: ['item_id'], filter: own(userId), sort: ['-played_at'], limit,
  })) as Array<{ item_id: string }>
  return rows.map((row) => String(row.item_id))
}

/** Records a search: it moves to the front; only the newest KEEP are kept. */
export async function recordSearch(userId: string, q: string): Promise<void> {
  const at = new Date().toISOString()
  const matches = await directus.request(readItems('play_history' as any, {
    fields: ['id', 'item_id'], filter: { ...own(userId), ...sameQuery(q) }, limit: -1,
  })) as Array<{ id: number, item_id: string }>
  const existing = matches.find((row) => row.item_id.toLowerCase() === q.toLowerCase())
  if (existing) await directus.request(updateItem('play_history' as any, existing.id, { item_id: q, played_at: at }))
  else await directus.request(createItem('play_history' as any, { user_id: userId, kind: KIND, item_id: q, played_at: at }))

  const older = await directus.request(readItems('play_history' as any, {
    fields: ['id'], filter: own(userId), sort: ['-played_at'], offset: KEEP, limit: -1,
  })) as Array<{ id: number }>
  if (older.length) await directus.request(deleteItems('play_history' as any, older.map((row) => row.id)))
}

/** Forgets one search (any letter case), or all of them when `q` is empty. */
export async function forgetSearches(userId: string, q = ''): Promise<void> {
  const rows = await directus.request(readItems('play_history' as any, {
    fields: ['id', 'item_id'], filter: q ? { ...own(userId), ...sameQuery(q) } : own(userId), limit: -1,
  })) as Array<{ id: number, item_id: string }>
  const ids = rows.filter((row) => !q || row.item_id.toLowerCase() === q.toLowerCase()).map((row) => row.id)
  if (ids.length) await directus.request(deleteItems('play_history' as any, ids))
}
