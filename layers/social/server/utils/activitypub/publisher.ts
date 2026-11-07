import type { Federation } from '@fedify/fedify'
import { Announce, Create, Delete, Note, PUBLIC_COLLECTION, Tombstone, Update, Video } from '@fedify/vocab'
import { Temporal } from 'temporal-polyfill'
import { redis } from '#shared/server/utils/redis'
import { actorByIdentifier } from './actors'
import { SITE_IDENTIFIER, federationEnabled, listIdentifier, memberIdentifier, siteOrigin, spaceIdentifier } from './config'
import { NOTE_FIELDS, PRODUCT_FIELDS, VIBE_FIELDS, listItemObject, noteObject, productObject, read, vibeObject, vibeProducts } from './content'
import { productPublisher } from './publisher-rules'
import { isBoost } from './setup'
import { federatedMembers, liveOutbox, markDeleted, markUpdated, publishedIds, recordPublished, shopPostedProducts, type ObjectType, type OutboxRow } from './store'

/**
 * Sends Meeovi's new items to their fediverse followers, then edits and
 * deletions. Run every couple of minutes by server/plugins/activitypub.ts,
 * on meeovi.com only (ACTIVITYPUB_FEDERATION=true). Fedify queues each
 * delivery in Redis and retries failures.
 *
 *  - member notes and vibez: from opted-in members, written after they
 *    turned it on (and within the last 30 days)
 *  - notes in a federated space: boosted by the space's account
 *  - products: posted by the seller's shop account (and boosted by the site
 *    account), or by the site account when the shop isn't on the fediverse
 *  - list items: posted by a public list's account, when its owner is on
 *  - edits: an Update when the item changed after it was sent
 *  - deletions: a Delete when an item is no longer public or its account
 *    was turned off (never when most items seem to vanish at once)
 *
 * ap_outbox records every item sent, so nothing is sent twice.
 */

type Row = Record<string, any>

const PER_RUN = { notes: 20, vibes: 10, products: 10, listItems: 20, updates: 20 }
const MAX_AGE_DAYS = 30
const LOCK_KEY = 'meeovi:activitypub-publisher:lock'

const cutoff = () => new Date(Date.now() - MAX_AGE_DAYS * 86_400_000).toISOString()
const later = (a: string, b: string) => (Date.parse(a) > Date.parse(b) ? a : b)
const oldestFirst = (key: string) => (a: Row, b: Row) => Date.parse(a[key]) - Date.parse(b[key])
const PUBLIC_POSTS = [
  { status: { _in: ['published', 'Published', 'public', 'Public'] } },
  { _or: [{ visibility_scope: { _null: true } }, { visibility_scope: { _eq: 'public' } }] },
]

const context = (federation: Federation<unknown>) => federation.createContext(new URL(siteOrigin()), undefined)

async function send(ctx: any, identifier: string, activity: any): Promise<void> {
  await ctx.sendActivity({ identifier }, 'followers', activity, { preferSharedInbox: true })
}

const createOf = (ctx: any, identifier: string, object: any) => new Create({
  id: new URL(`${object.id!.href}#create`), actor: ctx.getActorUri(identifier), object,
  to: PUBLIC_COLLECTION, cc: ctx.getFollowersUri(identifier), published: object.published ?? Temporal.Now.instant(),
})

const announceOf = (ctx: any, identifier: string, type: ObjectType, id: string, object: URL) => new Announce({
  id: new URL(`${ctx.getActorUri(identifier).href}#announce/${type}/${id}`), actor: ctx.getActorUri(identifier), object,
  to: PUBLIC_COLLECTION, cc: ctx.getFollowersUri(identifier), published: Temporal.Now.instant(),
})

// -- members' notes (and the spaces they're in) -----------------------------------

async function publishNotes(ctx: any): Promise<number> {
  const members = await federatedMembers()
  if (!members.length) return 0
  const byId = new Map(members.map((m) => [m.id, m]))
  const earliest = later(members.map((m) => m.since).sort()[0]!, cutoff())
  const notes = await read('posts', {
    fields: [...NOTE_FIELDS, 'spaces.spaces_id'],
    filter: { _and: [...PUBLIC_POSTS, { creator_id: { _in: [...byId.keys()] } }, { date_created: { _gte: earliest } }] },
    sort: ['-date_created'], limit: 100,
  })
  let sent = 0
  for (const note of notes.filter((n) => Date.parse(n.date_created) >= Date.parse(byId.get(n.creator_id)!.since)).sort(oldestFirst('date_created'))) {
    if (sent >= PER_RUN.notes) break
    const identifier = memberIdentifier(note.creator_id)
    if ((await publishedIds(identifier, 'note', [String(note.id)])).size) continue
    if (!(await recordPublished(identifier, 'note', String(note.id)))) continue
    const object = noteObject(ctx, identifier, note)
    await send(ctx, identifier, createOf(ctx, identifier, object))
    sent++
    // Boosted by each federated space it was posted in.
    for (const link of Array.isArray(note.spaces) ? note.spaces : []) {
      const spaceId = typeof link?.spaces_id === 'object' ? link?.spaces_id?.id : link?.spaces_id
      if (!spaceId) continue
      const space = spaceIdentifier(spaceId)
      if (!(await actorByIdentifier(space))) continue
      if (!(await recordPublished(space, 'space_post', String(note.id)))) continue
      await send(ctx, space, announceOf(ctx, space, 'space_post', String(note.id), object.id!))
    }
  }
  return sent
}

// -- vibez ------------------------------------------------------------------------

async function publishVibes(ctx: any): Promise<number> {
  const members = await federatedMembers()
  if (!members.length) return 0
  const byId = new Map(members.map((m) => [m.id, m]))
  const rows = await read('shorts', {
    fields: VIBE_FIELDS,
    filter: { _and: [{ creator_id: { _in: [...byId.keys()] } }, { status: { _in: ['published', 'Published'] } }, { date_created: { _gte: later(members.map((m) => m.since).sort()[0]!, cutoff()) } }] },
    sort: ['-date_created'], limit: 50,
  })
  let sent = 0
  for (const vibe of rows.filter((v) => Date.parse(v.date_created) >= Date.parse(byId.get(v.creator_id)!.since)).sort(oldestFirst('date_created'))) {
    if (sent >= PER_RUN.vibes) break
    if (!String(vibe.video_url || '').startsWith('https://')) continue
    const identifier = memberIdentifier(vibe.creator_id)
    if (!(await recordPublished(identifier, 'vibe', String(vibe.id)))) continue
    await send(ctx, identifier, createOf(ctx, identifier, vibeObject(ctx, identifier, vibe, await vibeProducts(vibe.id))))
    sent++
  }
  return sent
}

// -- products -------------------------------------------------------------------------

async function publishProducts(ctx: any): Promise<number> {
  const products = await read('products', {
    fields: PRODUCT_FIELDS,
    filter: { _and: [{ status: { _eq: 'published' } }, { created_at: { _gte: cutoff() } }] },
    sort: ['-created_at', '-id'], limit: 60,
  })
  const ids = products.map((p) => String(p.id))
  const done = new Set([...await publishedIds(SITE_IDENTIFIER, 'product', ids)])
  let sent = 0
  for (const product of products.sort(oldestFirst('created_at'))) {
    if (sent >= PER_RUN.products) break
    if (done.has(String(product.id))) continue
    const { author, boostedBySite } = await productPublisher(product)
    // The site's record marks a product as handled (posted or boosted).
    if (!(await recordPublished(SITE_IDENTIFIER, 'product', String(product.id)))) continue
    const object = productObject(ctx, author, product)
    if (author !== SITE_IDENTIFIER) {
      await recordPublished(author, 'product', String(product.id))
      await send(ctx, author, createOf(ctx, author, object))
    }
    await send(ctx, SITE_IDENTIFIER, boostedBySite
      ? announceOf(ctx, SITE_IDENTIFIER, 'product', String(product.id), object.id!)
      : createOf(ctx, SITE_IDENTIFIER, object))
    sent++
  }
  return sent
}

// -- list items -----------------------------------------------------------------------

async function publishListItems(ctx: any): Promise<number> {
  const members = await federatedMembers()
  if (!members.length) return 0
  const byId = new Map(members.map((m) => [m.id, m]))
  const lists = await read('lists', {
    fields: ['id', 'slug', 'name', 'status', 'user.user_id'],
    filter: { _and: [{ status: { _in: ['public', 'Public'] } }, { user: { user_id: { _in: [...byId.keys()] } } }] }, limit: 200,
  })
  let sent = 0
  for (const list of lists) {
    if (sent >= PER_RUN.listItems) break
    const owner = byId.get(list.user?.[0]?.user_id)
    if (!owner) continue
    const identifier = listIdentifier(list.id)
    const items = await read('list_items', {
      fields: ['id', 'title', 'description', 'link', 'list_id', 'date_created', 'post_id', 'products.products_id.id', 'products.products_id.slug', 'products.products_id.name'],
      filter: { _and: [{ list_id: { _eq: list.id } }, { date_created: { _gte: later(owner.since, cutoff()) } }] }, sort: ['date_created'], limit: 20,
    })
    for (const item of items) {
      if (sent >= PER_RUN.listItems) break
      if (!(await recordPublished(identifier, 'list_item', String(item.id)))) continue
      await send(ctx, identifier, createOf(ctx, identifier, listItemObject(ctx, identifier, list, item)))
      sent++
    }
  }
  return sent
}

// -- edits and deletions ------------------------------------------------------------------

/** The item as it is now, or null when it's no longer served. */
async function current(ctx: any, row: OutboxRow): Promise<{ object: any, updatedAt: string | null } | null> {
  if (!(await actorByIdentifier(row.identifier))) return null
  if (row.objectType === 'note') {
    const [note] = await read('posts', { fields: NOTE_FIELDS, filter: { _and: [...PUBLIC_POSTS, { id: { _eq: row.objectId } }] }, limit: 1 })
    return note ? { object: noteObject(ctx, row.identifier, note), updatedAt: note.date_updated ?? null } : null
  }
  if (row.objectType === 'vibe') {
    const [vibe] = await read('shorts', { fields: VIBE_FIELDS, filter: { _and: [{ id: { _eq: row.objectId } }, { status: { _in: ['published', 'Published'] } }] }, limit: 1 })
    return vibe ? { object: vibeObject(ctx, row.identifier, vibe, await vibeProducts(vibe.id)), updatedAt: vibe.date_updated ?? null } : null
  }
  if (row.objectType === 'product') {
    const [product] = await read('products', { fields: PRODUCT_FIELDS, filter: { _and: [{ status: { _eq: 'published' } }, { id: { _eq: row.objectId } }] }, limit: 1 })
    if (!product) return null
    const { author } = await productPublisher(product)
    // Only the author sends edits; the site's record just tracks the boost.
    return { object: author === row.identifier ? productObject(ctx, author, product) : null, updatedAt: author === row.identifier ? product.updated_at ?? null : null }
  }
  // Space boosts and list items: no edits to send; they stay while the account does.
  return { object: null, updatedAt: null }
}

const objectUriOf = (ctx: any, row: OutboxRow): URL => row.objectType === 'vibe'
  ? ctx.getObjectUri(Video, { id: row.objectId })
  : ctx.getObjectUri(Note, { id: row.objectType === 'product' ? `product-${row.objectId}` : row.objectType === 'list_item' ? `list-item-${row.objectId}` : row.objectId })

async function syncChanges(ctx: any, options: { deletions: boolean }): Promise<{ updated: number, deleted: number }> {
  const rows = await liveOutbox({ limit: 300 })
  let updated = 0
  const gone: OutboxRow[] = []
  for (const row of rows) {
    const now = await current(ctx, row)
    if (!now) { gone.push(row); continue }
    if (updated >= PER_RUN.updates || !now.object || !now.updatedAt) continue
    const since = (row.updatedAt ?? row.publishedAt).getTime()
    if (Date.parse(now.updatedAt) <= since + 1000) continue
    await send(ctx, row.identifier, new Update({
      id: new URL(`${now.object.id.href}#update/${Date.parse(now.updatedAt)}`), actor: ctx.getActorUri(row.identifier), object: now.object,
      to: PUBLIC_COLLECTION, cc: ctx.getFollowersUri(row.identifier), published: Temporal.Now.instant(),
    }))
    await markUpdated(row.id, new Date(now.updatedAt))
    updated++
  }
  if (!options.deletions || !gone.length) return { updated, deleted: 0 }
  if (gone.length > 3 && gone.length > rows.length / 2) {
    console.warn(`[activitypub] ${gone.length} of ${rows.length} items look gone at once; not deleting anything`)
    return { updated, deleted: 0 }
  }
  const shopPosted = await shopPostedProducts(gone.filter((r) => r.objectType === 'product').map((r) => r.objectId))
  for (const row of gone) {
    const object = objectUriOf(ctx, row)
    const boost = isBoost(row, shopPosted)
    await send(ctx, row.identifier, boost
      ? new Delete({ id: new URL(`${ctx.getActorUri(row.identifier).href}#delete/${row.objectType}/${row.objectId}`), actor: ctx.getActorUri(row.identifier), object: new URL(`${ctx.getActorUri(row.identifier).href}#announce/${row.objectType}/${row.objectId}`), to: PUBLIC_COLLECTION })
      : new Delete({ id: new URL(`${object.href}#delete`), actor: ctx.getActorUri(row.identifier), object: new Tombstone({ id: object }), to: PUBLIC_COLLECTION }))
    await markDeleted(row.id)
  }
  return { updated, deleted: gone.length }
}

// -- the run ----------------------------------------------------------------------------------

export type PublishResult = { notes: number, vibes: number, products: number, listItems: number, updated: number, deleted: number }

export async function runPublisher(federation: Federation<unknown>, options: { deletions?: boolean } = {}): Promise<PublishResult | null> {
  if (!federationEnabled()) return null
  const locked = await redis.set(LOCK_KEY, String(process.pid), 'EX', 300, 'NX')
  if (!locked) return null
  try {
    const ctx = context(federation)
    const step = async <T>(name: string, fn: () => Promise<T>, fallback: T) => fn().catch((error) => {
      console.error(`[activitypub] ${name}:`, (error as Error)?.message || error)
      return fallback
    })
    const notes = await step('notes', () => publishNotes(ctx), 0)
    const vibes = await step('vibez', () => publishVibes(ctx), 0)
    const products = await step('products', () => publishProducts(ctx), 0)
    const listItems = await step('list items', () => publishListItems(ctx), 0)
    const { updated, deleted } = await step('changes', () => syncChanges(ctx, { deletions: !!options.deletions }), { updated: 0, deleted: 0 })
    const result = { notes, vibes, products, listItems, updated, deleted }
    if (Object.values(result).some(Boolean)) console.info(`[activitypub] sent ${JSON.stringify(result)}`)
    return result
  } finally {
    await redis.del(LOCK_KEY).catch(() => {})
  }
}

/** A member turned it off: tell their followers the account is gone, then forget them. */
export async function retireActor(federation: Federation<unknown>, identifier: string): Promise<void> {
  const ctx = context(federation)
  const actor = ctx.getActorUri(identifier)
  await send(ctx, identifier, new Delete({ id: new URL(`${actor.href}#delete`), actor, object: actor, to: PUBLIC_COLLECTION }))
}
