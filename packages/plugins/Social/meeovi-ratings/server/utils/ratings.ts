import { createError, getRequestHeader } from 'h3'
import type { H3Event } from 'h3'
import type { CreatorRating, RatingOwnerField, RatingSummary } from '../../runtime/types'

/**
 * Universal 1–5 star ratings, stored in Directus `content_ratings`
 * (target_type, target_id, user_id = better-auth id, rating). One row per
 * user + item; rating again updates it. The rater always comes from the
 * session, never the request body. Items that record their creator (see
 * `owners`) can't be rated by that creator, and roll up into a creator score.
 */

type Config = {
  collection: string
  types: string[]
  owners: Record<string, RatingOwnerField>
  sessionEndpoint: string
  directus: { url: string, token: string }
}

export function ratingsConfig(event?: H3Event): Config {
  const own = (useRuntimeConfig(event) as Record<string, any>).meeoviRatings ?? {}
  return {
    collection: own.collection || 'content_ratings',
    types: own.types ?? [],
    owners: own.owners ?? {},
    sessionEndpoint: own.sessionEndpoint || '/api/auth/get-session',
    directus: {
      url: String(own.directus?.url || '').trim().replace(/^(['"])(.*)\1$/, '$2').replace(/\/+$/, ''),
      token: String(own.directus?.token || '').trim(),
    },
  }
}

function directus(event?: H3Event) {
  const { directus: { url, token } } = ratingsConfig(event)
  if (!url) throw createError({ statusCode: 503, statusMessage: 'Ratings are not configured' })
  return <T>(path: string, options: Record<string, any> = {}) =>
    $fetch<T>(`${url}${path}`, { timeout: 15000, ...options, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })
}

export async function ratingsUser(event: H3Event): Promise<{ id: string } | null> {
  const cookie = getRequestHeader(event, 'cookie')
  if (!cookie) return null
  try {
    const session = await $fetch<{ user?: { id?: string } } | null>(ratingsConfig(event).sessionEndpoint, { headers: { cookie } })
    return session?.user?.id ? { id: String(session.user.id) } : null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Keys

const ID = /^[A-Za-z0-9_.:-]{1,128}$/

export type ItemKey = { type: string, id: string }

export function checkItem(event: H3Event | undefined, type: unknown, id: unknown): ItemKey {
  const t = String(type ?? '').toLowerCase()
  if (!ratingsConfig(event).types.includes(t)) throw createError({ statusCode: 404, statusMessage: 'Unknown rating type' })
  const i = String(id ?? '')
  if (!ID.test(i)) throw createError({ statusCode: 400, statusMessage: 'Invalid item id' })
  return { type: t, id: i }
}

/** "post:12,product:9" → keys (max 100, unknown types / bad ids skipped). */
export function parseItems(event: H3Event, raw: unknown): ItemKey[] {
  const keys: ItemKey[] = []
  const seen = new Set<string>()
  for (const part of String(raw ?? '').split(',').slice(0, 100)) {
    const at = part.indexOf(':')
    if (at < 1) continue
    try {
      const key = checkItem(event, part.slice(0, at), part.slice(at + 1))
      const k = `${key.type}:${key.id}`
      if (!seen.has(k)) { seen.add(k); keys.push(key) }
    } catch { /* skip */ }
  }
  return keys
}

// ---------------------------------------------------------------------------
// Aggregates (cached briefly; writes invalidate)

type Agg = { average: number, count: number }
const AGG_TTL_MS = 30 * 1000
const aggCache = new Map<string, { at: number, agg: Agg }>()
const round1 = (n: number) => Math.round(n * 10) / 10

/** Average + count per item, grouped by target_id, one Directus call per type. */
export async function aggregates(event: H3Event | undefined, keys: ItemKey[]): Promise<Map<string, Agg>> {
  const out = new Map<string, Agg>()
  const missing = new Map<string, string[]>()
  for (const { type, id } of keys) {
    const hit = aggCache.get(`${type}:${id}`)
    if (hit && Date.now() - hit.at < AGG_TTL_MS) out.set(`${type}:${id}`, hit.agg)
    else missing.set(type, [...(missing.get(type) ?? []), id])
  }
  const { collection } = ratingsConfig(event)
  await Promise.all([...missing].map(async ([type, ids]) => {
    const res = await directus(event)<{ data: Array<{ target_id: string, avg: { rating: string | number | null }, count: string | number | { '*': string | number } }> }>(
      `/items/${collection}`, {
        query: {
          'aggregate[avg]': 'rating',
          'aggregate[count]': '*',
          'groupBy[]': 'target_id',
          filter: JSON.stringify({ target_type: { _eq: type }, target_id: { _in: ids } }),
          limit: -1,
        },
      })
    const found = new Map((res.data ?? []).map((r) => [String(r.target_id), r]))
    for (const id of ids) {
      const r = found.get(id)
      // Directus returns count as "3" (or { '*': "3" } on some versions).
      const count = r ? Number(typeof r.count === 'object' ? r.count?.['*'] : r.count) || 0 : 0
      const agg = { average: r ? round1(Number(r.avg?.rating) || 0) : 0, count }
      aggCache.set(`${type}:${id}`, { at: Date.now(), agg })
      out.set(`${type}:${id}`, agg)
    }
  }))
  return out
}

/** The user's own ratings for these items. */
export async function myRatings(event: H3Event, userId: string, keys: ItemKey[]): Promise<Map<string, { id: number, rating: number }>> {
  const out = new Map<string, { id: number, rating: number }>()
  if (!keys.length) return out
  const { collection } = ratingsConfig(event)
  const byType = new Map<string, string[]>()
  for (const k of keys) byType.set(k.type, [...(byType.get(k.type) ?? []), k.id])
  const res = await directus(event)<{ data: Array<{ id: number, target_type: string, target_id: string, rating: number }> }>(`/items/${collection}`, {
    query: {
      limit: -1,
      fields: 'id,target_type,target_id,rating',
      filter: JSON.stringify({
        user_id: { _eq: userId },
        _or: [...byType].map(([type, ids]) => ({ target_type: { _eq: type }, target_id: { _in: ids } })),
      }),
    },
  })
  for (const r of res.data ?? []) out.set(`${r.target_type}:${r.target_id}`, { id: r.id, rating: Number(r.rating) })
  return out
}

/** Creator user ids of items whose type records one (others absent). */
export async function owners(event: H3Event | undefined, keys: ItemKey[]): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  const config = ratingsConfig(event)
  const byType = new Map<string, string[]>()
  for (const k of keys) if (config.owners[k.type]) byType.set(k.type, [...(byType.get(k.type) ?? []), k.id])
  await Promise.all([...byType].map(async ([type, ids]) => {
    const { collection, field } = config.owners[type]!
    try {
      const res = await directus(event)<{ data: Array<Record<string, unknown>> }>(`/items/${collection}`, {
        query: { limit: -1, fields: `id,${field}`, filter: JSON.stringify({ id: { _in: ids } }) },
      })
      for (const r of res.data ?? []) if (r[field]) out.set(`${type}:${r.id}`, String(r[field]))
    } catch { /* collection unreadable — treat as no owner */ }
  }))
  return out
}

export async function summaries(event: H3Event, keys: ItemKey[], userId: string | null): Promise<Record<string, RatingSummary>> {
  const [aggs, mine, creators] = await Promise.all([
    aggregates(event, keys),
    userId ? myRatings(event, userId, keys) : Promise.resolve(new Map()),
    userId ? owners(event, keys) : Promise.resolve(new Map<string, string>()),
  ])
  const out: Record<string, RatingSummary> = {}
  for (const { type, id } of keys) {
    const k = `${type}:${id}`
    const own = Boolean(userId && creators.get(k) === userId)
    out[k] = {
      average: aggs.get(k)?.average ?? 0,
      count: aggs.get(k)?.count ?? 0,
      mine: mine.get(k)?.rating ?? null,
      canRate: Boolean(userId) && !own,
      own,
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Writes

export async function setRating(event: H3Event, userId: string, key: ItemKey, rating: number): Promise<void> {
  const k = `${key.type}:${key.id}`
  if ((await owners(event, [key])).get(k) === userId) {
    throw createError({ statusCode: 403, statusMessage: "You can't rate your own content" })
  }
  const { collection } = ratingsConfig(event)
  const existing = (await myRatings(event, userId, [key])).get(k)
  if (existing) {
    await directus(event)(`/items/${collection}/${existing.id}`, { method: 'PATCH', body: { rating } })
  } else {
    await directus(event)(`/items/${collection}`, {
      method: 'POST',
      body: { target_type: key.type, target_id: key.id, user_id: userId, rating },
    })
  }
  aggCache.delete(k)
}

export async function clearRating(event: H3Event, userId: string, key: ItemKey): Promise<void> {
  const k = `${key.type}:${key.id}`
  const existing = (await myRatings(event, userId, [key])).get(k)
  if (existing) await directus(event)(`/items/${ratingsConfig(event).collection}/${existing.id}`, { method: 'DELETE' })
  aggCache.delete(k)
}

// ---------------------------------------------------------------------------
// Creator score

const CREATOR_TTL_MS = 60 * 1000
const creatorCache = new Map<string, { at: number, score: CreatorRating }>()

/** Average of all ratings on items this user created, overall and per type. */
export async function creatorRating(event: H3Event | undefined, userId: string): Promise<CreatorRating> {
  const hit = creatorCache.get(userId)
  if (hit && Date.now() - hit.at < CREATOR_TTL_MS) return hit.score
  const config = ratingsConfig(event)
  const byType: CreatorRating['byType'] = []
  for (const [type, { collection, field, label }] of Object.entries(config.owners)) {
    let ids: string[] = []
    try {
      const res = await directus(event)<{ data: Array<{ id: unknown }> }>(`/items/${collection}`, {
        query: { limit: -1, fields: 'id', filter: JSON.stringify({ [field]: { _eq: userId } }) },
      })
      ids = (res.data ?? []).map((r) => String(r.id))
    } catch { continue }
    if (!ids.length) continue
    let sum = 0
    let count = 0
    for (let i = 0; i < ids.length; i += 100) {
      const aggs = await aggregates(event, ids.slice(i, i + 100).map((id) => ({ type, id })))
      for (const a of aggs.values()) { sum += a.average * a.count; count += a.count }
    }
    // Several item types can share a label (e.g. 'vibe' and 'shorts').
    const same = byType.find((b) => b.label === label)
    if (same) {
      const total = same.count + count
      same.average = total ? round1((same.average * same.count + sum) / total) : 0
      same.count = total
    } else if (count) {
      byType.push({ type, label, average: round1(sum / count), count })
    }
  }
  const count = byType.reduce((n, b) => n + b.count, 0)
  const average = count ? round1(byType.reduce((s, b) => s + b.average * b.count, 0) / count) : 0
  const score = { average, count, byType: byType.filter((b) => b.count) }
  creatorCache.set(userId, { at: Date.now(), score })
  return score
}
