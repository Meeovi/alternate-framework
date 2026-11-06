// Meeovi on Bluesky: new products and members' notes posted as Bluesky
// posts, which the "Meeovi" feed (server/utils/feedgen.ts) then lists.
//
//  - Products: every newly published product (Directus `products`) is
//    posted by the site's own Bluesky account (ATPROTO_IDENTIFIER) with a
//    link card to its page.
//  - Notes: members who connected Bluesky and turned on "Also post my
//    notes to Bluesky" (users.raw_user_meta_data.blueskyCrosspost) have
//    their public notes posted from their own Bluesky account, from the
//    moment they turned it on.
//
// A background job (server/plugins/atproto-crosspost.ts) runs this every
// few minutes, on one server only: ATPROTO_CROSSPOST=true (meeovi.com; the
// demo shares the database and must not post). Each run posts at most a few
// items, oldest first, so a big import is spread out instead of flooding
// Bluesky, and only items from the last 30 days are considered — the first
// run therefore backfills the most recent ones. atproto_crossposts records
// every post, so nothing is posted twice; when a product or note stops
// being published its Bluesky post is deleted.
import { and, desc, eq, gte, inArray, isNull, or, sql } from 'drizzle-orm'
import { createDirectus, readItems, rest, staticToken } from '@directus/sdk'
import { db } from '#auth/server/utils/drizzle'
import { atprotoCrossposts, atprotoSessions, users } from '#auth/server/database/migrations/schema'
import { redis } from '#shared/server/utils/redis'
import { useAtprotoClient } from '@mframework/meeovi-atproto/client'
import { linkCardEmbed, type LinkCard } from '@mframework/meeovi-atproto/linkcard'
import { PUBLIC_POSTS, toPlainText } from './federation-directus'
import { openMemberSession } from './federation-members'
import { useFederationNetwork } from './federation'

type Row = Record<string, any>

/** Posts per run (every 5 minutes): ~24 products and ~48 notes an hour at most. */
const PRODUCTS_PER_RUN = 2
const NOTES_PER_RUN = 4
/** How far back a run looks, and how many of the newest it considers. */
const MAX_AGE_DAYS = 30
const WINDOW = 30
/** Bluesky's post limit (graphemes). */
const POST_LIMIT = 300
const LOCK_KEY = 'meeovi:atproto-crosspost:lock'

export const crosspostEnabled = () => process.env.ATPROTO_CROSSPOST === 'true'

const siteUrl = () => String(process.env.NUXT_PUBLIC_SITE_URL || 'https://meeovi.com').replace(/\/+$/, '')
const directusUrl = () => String(process.env.DIRECTUS_URL || '').replace(/\/+$/, '')

// Throws on failure (callers must not mistake an error for "nothing there").
const read = (collection: string, query: Row): Promise<Row[]> =>
  createDirectus(directusUrl()).with(rest()).with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))
    .request(readItems(collection as any, query as any)) as Promise<Row[]>

// -- text ---------------------------------------------------------------------

const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
const graphemes = (text: string) => [...segmenter.segment(text)].map((s) => s.segment)

/** `text` cut to `max` graphemes, at a word boundary when one is near, with "…". */
export function clip(text: string, max: number): string {
  const clean = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  const chars = graphemes(clean)
  if (chars.length <= max) return clean
  const cut = chars.slice(0, max - 1).join('')
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`
}

/** "Free", or the price in its currency ("$9.99"). */
export function priceLabel(price: unknown, currency?: unknown): string {
  const value = Number(price)
  if (!Number.isFinite(value) || value <= 0) return 'Free'
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: String(currency || 'USD').toUpperCase() }).format(value)
  } catch {
    return `$${value.toFixed(2)}`
  }
}

const imageOf = (row: Row): string | undefined => {
  if (typeof row.image_url === 'string' && row.image_url.startsWith('https://')) return row.image_url
  const id = typeof row.image === 'string' ? row.image : row.image?.id
  return id && /^[\w-]{8,}$/.test(id) && directusUrl().startsWith('https://') ? `${directusUrl()}/assets/${id}` : undefined
}

export function productPost(product: Row, site = siteUrl()): { text: string, card: LinkCard } {
  const name = clip(String(product.name || 'A new product'), 120)
  const description = toPlainText(product.short_description) || toPlainText(product.content) || toPlainText(product.meta_description)
  const head = `New on Meeovi: ${name} (${priceLabel(product.price, product.currency_code)})`
  const room = POST_LIMIT - graphemes(head).length - 2
  return {
    text: description && room > 20 ? `${head}\n\n${clip(description, room)}` : clip(head, POST_LIMIT),
    card: {
      url: `${site}/product/${encodeURIComponent(String(product.slug || product.id))}`,
      title: name,
      description: clip(description || `${priceLabel(product.price, product.currency_code)} on Meeovi`, 280),
      image: imageOf(product),
    },
  }
}

export function notePost(note: Row, site = siteUrl()): { text: string, card: LinkCard } | null {
  const body = toPlainText(note.content) || toPlainText(note.summary)
  const title = String(note.title || '').trim()
  const text = clip(body || title, POST_LIMIT)
  if (!text) return null
  return {
    text,
    card: {
      url: `${site}/connect/note/${encodeURIComponent(String(note.slug || note.id))}`,
      title: clip(title || 'A note on Meeovi', 120),
      description: clip(body || title, 200),
      image: imageOf(note),
    },
  }
}

// -- what's already posted --------------------------------------------------------

async function postedIds(sourceType: 'product' | 'note', ids: string[]): Promise<Set<string>> {
  if (!ids.length) return new Set()
  const rows = await db.select({ id: atprotoCrossposts.sourceId }).from(atprotoCrossposts)
    .where(and(eq(atprotoCrossposts.sourceType, sourceType), inArray(atprotoCrossposts.sourceId, ids)))
  return new Set(rows.map((r) => r.id))
}

async function record(row: typeof atprotoCrossposts.$inferInsert) {
  await db.insert(atprotoCrossposts).values(row).onConflictDoNothing()
}

const cutoff = () => new Date(Date.now() - MAX_AGE_DAYS * 86_400_000).toISOString()
const oldestFirst = (a: Row, b: Row, key: string) => Date.parse(a[key]) - Date.parse(b[key])

// -- products ---------------------------------------------------------------

async function crosspostProducts(): Promise<number> {
  const client = useAtprotoClient()
  if (!client.did) throw new Error("the site's Bluesky account isn't signed in")
  const products = await read('products', {
    fields: ['id', 'slug', 'name', 'short_description', 'content', 'meta_description', 'price', 'currency_code', 'image', 'image_url', 'created_at'],
    filter: { _and: [{ status: { _eq: 'published' } }, { created_at: { _gte: cutoff() } }] },
    sort: ['-created_at', '-id'],
    limit: WINDOW,
  })
  const done = await postedIds('product', products.map((p) => String(p.id)))
  const todo = products.filter((p) => !done.has(String(p.id))).sort((a, b) => oldestFirst(a, b, 'created_at')).slice(0, PRODUCTS_PER_RUN)
  for (const product of todo) {
    const { text, card } = productPost(product)
    const created = await client.createPost({ text, langs: ['en'], externalEmbed: await linkCardEmbed(client, card) })
    await record({ sourceType: 'product', sourceId: String(product.id), authorDid: client.did, uri: created.uri, cid: created.cid })
  }
  return todo.length
}

// -- members' notes -----------------------------------------------------------

/** Members who turned crossposting on and still have a Bluesky connection. */
async function optedInMembers(): Promise<Array<{ id: string, did: string, since: string }>> {
  const rows = await db.select({
    id: users.id,
    did: atprotoSessions.did,
    since: sql<string | null>`${users.rawUserMetaData} -> 'blueskyCrosspost' ->> 'since'`,
  }).from(users)
    .innerJoin(atprotoSessions, eq(atprotoSessions.userId, users.id))
    .where(and(
      sql`${users.rawUserMetaData} -> 'blueskyCrosspost' ->> 'enabled' = 'true'`,
      isNull(users.deletedAt),
      or(isNull(users.authBanned), eq(users.authBanned, false)),
    ))
    .limit(500)
  return rows.filter((r): r is { id: string, did: string, since: string } => !!r.since && !Number.isNaN(Date.parse(r.since)))
}

async function crosspostNotes(): Promise<number> {
  const members = await optedInMembers()
  if (!members.length) return 0
  const byId = new Map(members.map((m) => [m.id, m]))
  const earliest = members.map((m) => m.since).sort()[0]!
  const notes = await read('posts', {
    fields: ['id', 'slug', 'title', 'summary', 'content', 'image', 'image_url', 'date_created', 'creator_id'],
    filter: { _and: [...PUBLIC_POSTS, { creator_id: { _in: [...byId.keys()] } }, { date_created: { _gte: earliest > cutoff() ? earliest : cutoff() } }] },
    sort: ['-date_created'],
    limit: WINDOW,
  })
  // Only notes written after that member turned crossposting on.
  const eligible = notes.filter((n) => byId.has(n.creator_id) && Date.parse(n.date_created) >= Date.parse(byId.get(n.creator_id)!.since))
  const done = await postedIds('note', eligible.map((n) => String(n.id)))
  const todo = eligible.filter((n) => !done.has(String(n.id))).sort((a, b) => oldestFirst(a, b, 'date_created')).slice(0, NOTES_PER_RUN)
  const network = useFederationNetwork('atproto')
  let posted = 0
  for (const note of todo) {
    const content = notePost(note)
    if (!content) continue
    const session = await openMemberSession(network, note.creator_id).catch(() => null)
    if (!session?.publish) continue // their Bluesky session expired: they need to reconnect
    const created = await session.publish({ text: content.text, card: content.card, langs: ['en'] })
    await record({ sourceType: 'note', sourceId: String(note.id), userId: note.creator_id, authorDid: byId.get(note.creator_id)!.did, uri: created.id })
    posted++
  }
  return posted
}

// -- unpublished items ------------------------------------------------------------

/**
 * Deletes the Bluesky posts of products and notes that are no longer
 * published. Only acts on a successful read, and refuses when most items
 * seem to have vanished at once (a broken query, not real unpublishing).
 */
async function removeUnpublished(): Promise<number> {
  const rows = await db.select().from(atprotoCrossposts)
    .where(gte(atprotoCrossposts.createdAt, new Date(Date.now() - 90 * 86_400_000)))
    .orderBy(desc(atprotoCrossposts.createdAt)).limit(200)
  let removed = 0
  for (const [type, collection, filter] of [
    ['product', 'products', [{ status: { _eq: 'published' } }]],
    ['note', 'posts', PUBLIC_POSTS],
  ] as const) {
    const mine = rows.filter((r) => r.sourceType === type)
    if (!mine.length) continue
    const live = await read(collection, { fields: ['id'], filter: { _and: [...filter, { id: { _in: mine.map((r) => r.sourceId) } }] }, limit: mine.length })
    const liveIds = new Set(live.map((r) => String(r.id)))
    const gone = mine.filter((r) => !liveIds.has(r.sourceId))
    if (gone.length > 3 && gone.length > mine.length / 2) {
      console.warn(`[crosspost] ${gone.length} of ${mine.length} ${type}s look unpublished at once; not deleting anything`)
      continue
    }
    for (const row of gone) {
      try {
        if (type === 'product') {
          await useAtprotoClient().deletePost(row.uri)
        } else if (row.userId) {
          const session = await openMemberSession(useFederationNetwork('atproto'), row.userId).catch(() => null)
          await session?.unpublish?.(row.uri)
        }
      } catch (error) {
        console.warn(`[crosspost] could not delete ${row.uri}:`, (error as Error)?.message || error)
      }
      // Out of the feed either way.
      await db.delete(atprotoCrossposts).where(eq(atprotoCrossposts.id, row.id))
      removed++
    }
  }
  return removed
}

// -- the run ----------------------------------------------------------------------

/** One run (the background job calls this). Skips when another run holds the lock. */
export async function runCrosspost(options: { removeUnpublished?: boolean } = {}): Promise<{ products: number, notes: number, removed: number } | null> {
  if (!crosspostEnabled()) return null
  const locked = await redis.set(LOCK_KEY, String(process.pid), 'EX', 240, 'NX')
  if (!locked) return null
  try {
    const step = async (name: string, fn: () => Promise<number>) => fn().catch((error) => {
      console.error(`[crosspost] ${name}:`, (error as Error)?.message || error)
      return 0
    })
    const products = await step('products', crosspostProducts)
    const notes = await step('notes', crosspostNotes)
    const removed = options.removeUnpublished ? await step('unpublished', removeUnpublished) : 0
    if (products || notes || removed) console.info(`[crosspost] posted ${products} products, ${notes} notes; removed ${removed}`)
    return { products, notes, removed }
  } finally {
    await redis.del(LOCK_KEY).catch(() => {})
  }
}

/** Newest crossposted Bluesky posts, for the "Meeovi" feed. */
export async function crosspostedUris(limit = 300): Promise<Array<{ uri: string, createdAt: Date }>> {
  return db.select({ uri: atprotoCrossposts.uri, createdAt: atprotoCrossposts.createdAt })
    .from(atprotoCrossposts).orderBy(desc(atprotoCrossposts.createdAt)).limit(limit)
}
