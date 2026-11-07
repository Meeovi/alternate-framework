import { and, count, desc, eq, inArray, isNull, like, lt, or, sql } from 'drizzle-orm'
import { db } from '#auth/server/utils/drizzle'
import { apActorKeys, apFollowers, apInteractions, apOutbox, users } from '#auth/server/database/migrations/schema'

/**
 * ActivityPub data that must survive a restart (migration
 * 20261107010000_activitypub). Fedify's cache and queue are in Redis.
 */

// -- keys ---------------------------------------------------------------------

export type StoredKey = { keyType: string, privateKey: JsonWebKey, publicKey: JsonWebKey }

export async function readKeys(identifier: string): Promise<StoredKey[]> {
  const rows = await db.select().from(apActorKeys).where(eq(apActorKeys.identifier, identifier))
  return rows.map((r) => ({ keyType: r.keyType, privateKey: r.privateKey as JsonWebKey, publicKey: r.publicKey as JsonWebKey }))
}

/** Saves a new key; when another server process saved one first, that one wins. */
export async function saveKey(identifier: string, key: StoredKey): Promise<void> {
  await db.insert(apActorKeys).values({ identifier, keyType: key.keyType, privateKey: key.privateKey, publicKey: key.publicKey })
    .onConflictDoNothing()
}

// -- followers ------------------------------------------------------------------

export type Follower = typeof apFollowers.$inferSelect

export async function addFollower(row: typeof apFollowers.$inferInsert): Promise<void> {
  await db.insert(apFollowers).values(row).onConflictDoUpdate({
    target: [apFollowers.identifier, apFollowers.actorUri],
    set: { followId: row.followId, handle: row.handle, name: row.name, url: row.url, inboxUrl: row.inboxUrl, sharedInboxUrl: row.sharedInboxUrl },
  })
}

export async function removeFollower(identifier: string, actorUri: string): Promise<number> {
  const removed = await db.delete(apFollowers)
    .where(and(eq(apFollowers.identifier, identifier), eq(apFollowers.actorUri, actorUri)))
    .returning({ actorUri: apFollowers.actorUri })
  return removed.length
}

/** A remote account that went away (Delete of the actor): drop it everywhere. */
export async function removeFollowerEverywhere(actorUri: string): Promise<void> {
  await db.delete(apFollowers).where(eq(apFollowers.actorUri, actorUri))
}

/** One page of followers, newest first; `cursor` = created_at ISO of the last one seen. */
export async function listFollowers(identifier: string, cursor: string | null, limit: number): Promise<{ items: Follower[], next: string | null }> {
  const rows = await db.select().from(apFollowers)
    .where(and(eq(apFollowers.identifier, identifier), cursor ? lt(apFollowers.createdAt, new Date(cursor)) : undefined))
    .orderBy(desc(apFollowers.createdAt)).limit(limit + 1)
  const items = rows.slice(0, limit)
  return { items, next: rows.length > limit ? items[items.length - 1]!.createdAt.toISOString() : null }
}

export async function countFollowers(identifier: string): Promise<number> {
  const [row] = await db.select({ n: count() }).from(apFollowers).where(eq(apFollowers.identifier, identifier))
  return Number(row?.n ?? 0)
}

export async function hasFollowers(identifier: string): Promise<boolean> {
  const [row] = await db.select({ n: count() }).from(apFollowers).where(eq(apFollowers.identifier, identifier))
  return Number(row?.n ?? 0) > 0
}

// -- outbox -------------------------------------------------------------------------

export type ObjectType = 'note' | 'product' | 'vibe' | 'space_post' | 'list_item'
export type OutboxRow = typeof apOutbox.$inferSelect

export async function publishedIds(identifier: string, objectType: ObjectType, ids: string[]): Promise<Set<string>> {
  if (!ids.length) return new Set()
  const rows = await db.select({ id: apOutbox.objectId }).from(apOutbox)
    .where(and(eq(apOutbox.identifier, identifier), eq(apOutbox.objectType, objectType), inArray(apOutbox.objectId, ids)))
  return new Set(rows.map((r) => r.id))
}

/**
 * Of these products, the ones a shop account posted. The site account's row
 * for such a product is a boost (Announce); for the rest the site posted it.
 */
export async function shopPostedProducts(ids: string[]): Promise<Set<string>> {
  if (!ids.length) return new Set()
  const rows = await db.select({ id: apOutbox.objectId }).from(apOutbox)
    .where(and(eq(apOutbox.objectType, 'product'), like(apOutbox.identifier, 'shop-%'), inArray(apOutbox.objectId, ids)))
  return new Set(rows.map((r) => r.id))
}

/** Records a Create; false when it was already recorded (another run sent it). */
export async function recordPublished(identifier: string, objectType: ObjectType, objectId: string, at?: Date): Promise<boolean> {
  const rows = await db.insert(apOutbox).values({ identifier, objectType, objectId, publishedAt: at ?? new Date() })
    .onConflictDoNothing().returning({ id: apOutbox.id })
  return rows.length > 0
}

export async function markUpdated(id: string, at: Date): Promise<void> {
  await db.update(apOutbox).set({ updatedAt: at }).where(eq(apOutbox.id, id))
}

export async function markDeleted(id: string): Promise<void> {
  await db.update(apOutbox).set({ deletedAt: new Date() }).where(eq(apOutbox.id, id))
}

/** Live (not deleted) outbox rows, newest first. */
export async function liveOutbox(options: { identifier?: string, objectType?: ObjectType, limit: number, before?: string | null }): Promise<OutboxRow[]> {
  return db.select().from(apOutbox).where(and(
    isNull(apOutbox.deletedAt),
    options.identifier ? eq(apOutbox.identifier, options.identifier) : undefined,
    options.objectType ? eq(apOutbox.objectType, options.objectType) : undefined,
    options.before ? lt(apOutbox.publishedAt, new Date(options.before)) : undefined,
  )).orderBy(desc(apOutbox.publishedAt)).limit(options.limit)
}

/** Is this item federated by any actor (so remote replies/likes on it count)? */
export async function findPublished(objectType: ObjectType, objectId: string): Promise<OutboxRow | null> {
  const [row] = await db.select().from(apOutbox)
    .where(and(eq(apOutbox.objectType, objectType), eq(apOutbox.objectId, objectId), isNull(apOutbox.deletedAt))).limit(1)
  return row ?? null
}

export async function countOutbox(identifier: string): Promise<number> {
  const [row] = await db.select({ n: count() }).from(apOutbox).where(and(eq(apOutbox.identifier, identifier), isNull(apOutbox.deletedAt)))
  return Number(row?.n ?? 0)
}

// -- interactions --------------------------------------------------------------------

export type InteractionKind = 'like' | 'announce' | 'reply'

/** Records a like/boost/reply; false when this activity was already seen. */
export async function recordInteraction(row: typeof apInteractions.$inferInsert): Promise<boolean> {
  const rows = await db.insert(apInteractions).values(row).onConflictDoNothing().returning({ id: apInteractions.id })
  return rows.length > 0
}

/** Undo of a like/boost: the activity it undoes. */
export async function removeInteraction(activityId: string, actorUri: string): Promise<boolean> {
  const rows = await db.delete(apInteractions)
    .where(and(eq(apInteractions.activityId, activityId), eq(apInteractions.actorUri, actorUri)))
    .returning({ id: apInteractions.id })
  return rows.length > 0
}

/** A reply deleted on its server. */
export async function removeReply(objectUri: string, actorUri: string): Promise<boolean> {
  const rows = await db.delete(apInteractions)
    .where(and(eq(apInteractions.kind, 'reply'), eq(apInteractions.objectUri, objectUri), eq(apInteractions.actorUri, actorUri)))
    .returning({ id: apInteractions.id })
  return rows.length > 0
}

export async function interactionCounts(objectType: ObjectType, objectId: string): Promise<{ likes: number, boosts: number, replies: number }> {
  const rows = await db.select({ kind: apInteractions.kind, n: count() }).from(apInteractions)
    .where(and(eq(apInteractions.objectType, objectType), eq(apInteractions.objectId, objectId)))
    .groupBy(apInteractions.kind)
  const by = Object.fromEntries(rows.map((r) => [r.kind, Number(r.n)]))
  return { likes: by.like ?? 0, boosts: by.announce ?? 0, replies: by.reply ?? 0 }
}

// -- member settings -------------------------------------------------------------------

/**
 * users.raw_user_meta_data.activitypub = { enabled, shop, since }:
 * enabled — their profile and public notes are on the fediverse;
 * shop — their shop too (sellers); since — when they turned it on (only
 * notes from then on are sent).
 */
export type MemberSettings = { enabled: boolean, shop: boolean, since: string | null }

export async function readApSettings(userId: string): Promise<MemberSettings> {
  const [row] = await db.select({ meta: sql<Record<string, any> | null>`${users.rawUserMetaData} -> 'activitypub'` })
    .from(users).where(eq(users.id, userId)).limit(1)
  const s = row?.meta ?? {}
  return { enabled: s.enabled === true, shop: s.shop === true, since: typeof s.since === 'string' ? s.since : null }
}

export async function writeApSettings(userId: string, settings: MemberSettings): Promise<void> {
  await db.update(users).set({
    rawUserMetaData: sql`jsonb_set(coalesce(${users.rawUserMetaData}, '{}'::jsonb), '{activitypub}', ${JSON.stringify(settings)}::jsonb, true)`,
  }).where(eq(users.id, userId))
}

export type FederatedMember = { id: string, username: string, name: string | null, image: string | null, role: string | null, since: string, shop: boolean, createdAt: Date | null }

const visible = () => and(isNull(users.deletedAt), or(isNull(users.authBanned), eq(users.authBanned, false)))

const MEMBER_FIELDS = {
  id: users.id,
  username: users.username,
  name: users.name,
  image: users.image,
  role: users.authRole,
  createdAt: users.createdAt,
  since: sql<string | null>`${users.rawUserMetaData} -> 'activitypub' ->> 'since'`,
  shop: sql<string | null>`${users.rawUserMetaData} -> 'activitypub' ->> 'shop'`,
}

const toMember = (r: any): FederatedMember | null => (r?.username && r.since
  ? { id: r.id, username: r.username, name: r.name ?? null, image: r.image ?? null, role: r.role ?? null, since: r.since, shop: r.shop === 'true', createdAt: r.createdAt ?? null }
  : null)

const optedIn = sql`${users.rawUserMetaData} -> 'activitypub' ->> 'enabled' = 'true'`

/** An opted-in, visible member by id or username. */
export async function federatedMember(by: { id?: string, username?: string }): Promise<FederatedMember | null> {
  const where = by.id ? eq(users.id, by.id) : by.username ? eq(users.username, by.username.toLowerCase()) : undefined
  if (!where) return null
  const [row] = await db.select(MEMBER_FIELDS).from(users).where(and(where, optedIn, visible())).limit(1)
  return toMember(row)
}

/** Every opted-in member (the publisher's list). */
export async function federatedMembers(): Promise<FederatedMember[]> {
  const rows = await db.select(MEMBER_FIELDS).from(users).where(and(optedIn, visible())).limit(2000)
  return rows.map(toMember).filter((m): m is FederatedMember => !!m)
}

/** An account turned off: forget its followers and mark everything it sent as deleted. */
export async function forgetActor(identifier: string): Promise<void> {
  await db.delete(apFollowers).where(eq(apFollowers.identifier, identifier))
  await db.update(apOutbox).set({ deletedAt: new Date() }).where(and(eq(apOutbox.identifier, identifier), isNull(apOutbox.deletedAt)))
}
