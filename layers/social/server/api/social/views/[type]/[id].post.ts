import { createDirectus, rest, staticToken, readItem, updateItem } from '@directus/sdk'
import { createError, defineEventHandler, getRouterParam } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'

/**
 * POST /api/social/views/:type/:id — count a view of a note or vibe.
 *
 * A view counts once per signed-in person per item per 24 hours, so
 * refreshing or reopening doesn't inflate it, and a creator viewing their own
 * item doesn't count. Returns the item's current total either way, so the
 * page can show an up-to-date number.
 *
 * The dedupe window lives in this server process, so a restart can let one
 * repeat view per person through. The increment is read-then-write, so a
 * simultaneous view can occasionally be lost. Both are acceptable for a view
 * counter.
 */

const COLLECTIONS: Record<string, { collection: string, owner: string }> = {
  post: { collection: 'posts', owner: 'creator_id' },
  shorts: { collection: 'shorts', owner: 'creator_id' },
}

const WINDOW_MS = 24 * 60 * 60 * 1000
const MAX_SEEN = 50_000
const seen = new Map<string, number>()

function recentlySeen(key: string): boolean {
  const now = Date.now()
  const at = seen.get(key)
  if (at && now - at < WINDOW_MS) return true
  seen.set(key, now)
  if (seen.size > MAX_SEEN) {
    for (const [k, t] of seen) {
      if (now - t >= WINDOW_MS || seen.size > MAX_SEEN) seen.delete(k)
      else break
    }
  }
  return false
}

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const type = String(getRouterParam(event, 'type') || '')
  const id = String(getRouterParam(event, 'id') || '')
  const target = COLLECTIONS[type]
  if (!target) throw createError({ statusCode: 404, statusMessage: 'Unknown content type' })
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const item = await directus.request(readItem(target.collection, id, { fields: ['id', 'views', target.owner] })).catch(() => null) as Record<string, any> | null
  if (!item) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const views = Number(item.views) || 0
  const own = item[target.owner] && String(item[target.owner]) === String(user.id)
  if (own || recentlySeen(`${type}:${id}:${user.id}`)) return { views, counted: false }

  await directus.request(updateItem(target.collection, id, { views: views + 1 }))
  return { views: views + 1, counted: true }
})
