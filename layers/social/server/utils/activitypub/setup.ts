import { exportJwk, generateCryptoKeyPair, importJwk, type Federation } from '@fedify/fedify'
import {
  Accept, Announce, Create, Delete, Endpoints, Flag, Follow, Group, Image, Like, Note, Organization, Person,
  PropertyValue, Service, Tombstone, Undo, Update, Video, isActor, type Actor,
} from '@fedify/vocab'
import { Temporal } from 'temporal-polyfill'
import { actorByIdentifier, identifierForHandle, type ActorInfo } from './actors'
import { memberIdentifier, parseIdentifier, siteOrigin } from './config'
import { listItem, listItemObject, noteObject, productObject, publicNote, publishedProduct, publishedVibe, vibeObject, vibeProducts } from './content'
import { onFlag, onLike, onRemoteDelete, onReply, onUndoInteraction } from './interactions'
import { productPublisher } from './publisher-rules'
import { addFollower, countFollowers, countOutbox, listFollowers, liveOutbox, readKeys, removeFollower, saveKey, shopPostedProducts, type OutboxRow } from './store'

/**
 * Everything Meeovi answers and accepts on the fediverse, registered on the
 * Fedify instance (server/federation.ts):
 *
 *   /.well-known/webfinger, /.well-known/nodeinfo   (Fedify)
 *   /ap/actors/{identifier}                          accounts (utils/activitypub/actors.ts)
 *   /ap/actors/{identifier}/inbox, /ap/inbox         follows, likes, boosts, replies, reports
 *   /ap/actors/{identifier}/outbox|followers
 *   /ap/notes/{id}                                   notes, products ("product-<id>"), list items ("list-item-<id>")
 *   /ap/vibez/{id}                                   vibez (Video)
 */

const PAGE = 40
const KEY_TYPES = ['RSASSA-PKCS1-v1_5', 'Ed25519'] as const

const toInstant = (iso: string | null) => (iso && Number.isFinite(Date.parse(iso)) ? Temporal.Instant.fromEpochMilliseconds(Date.parse(iso)) : null)

function actorObject(ctx: any, info: ActorInfo, keys: any[]): Actor {
  const common = {
    id: ctx.getActorUri(info.identifier),
    preferredUsername: info.handle,
    name: info.name,
    summary: info.summary ? `<p>${info.summary.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : null,
    url: new URL(info.url),
    icon: info.icon ? new Image({ url: new URL(info.icon) }) : null,
    image: info.image ? new Image({ url: new URL(info.image) }) : null,
    published: toInstant(info.published),
    inbox: ctx.getInboxUri(info.identifier),
    outbox: ctx.getOutboxUri(info.identifier),
    followers: ctx.getFollowersUri(info.identifier),
    endpoints: new Endpoints({ sharedInbox: ctx.getInboxUri() }),
    publicKey: keys[0]?.cryptographicKey ?? null,
    assertionMethods: keys.map((k) => k.multikey),
    manuallyApprovesFollowers: false,
    discoverable: true,
    indexable: info.kind === 'member' || info.kind === 'shop' || info.kind === 'site',
    attachments: [new PropertyValue({ name: 'Meeovi', value: `<a href="${info.url}" rel="me">${info.url.replace(/^https:\/\//, '')}</a>` })],
  }
  switch (info.kind) {
    case 'member': return new Person(common)
    case 'shop': return new Organization(common)
    case 'space': return new Group(common)
    default: return new Service(common)
  }
}

/** A member note, product or list item, by its object id ("123", "product-45", "list-item-9"). */
async function noteById(ctx: any, id: string): Promise<Note | null> {
  if (/^\d{1,12}$/.test(id)) {
    const note = await publicNote(id)
    if (!note?.creator_id) return null
    const identifier = memberIdentifier(String(note.creator_id))
    if (!(await actorByIdentifier(identifier))) return null
    return noteObject(ctx, identifier, note)
  }
  const product = /^product-(\d{1,18})$/.exec(id)
  if (product) {
    const row = await publishedProduct(product[1]!)
    if (!row) return null
    const { author } = await productPublisher(row)
    return productObject(ctx, author, row)
  }
  const item = /^list-item-(\d{1,12})$/.exec(id)
  if (item) {
    const row = await listItem(item[1]!)
    if (!row?.list_id) return null
    const identifier = `list-${typeof row.list_id === 'object' ? row.list_id.id : row.list_id}`
    const list = await actorByIdentifier(identifier)
    if (!list) return null
    return listItemObject(ctx, identifier, { id: list.key, name: list.name, slug: null }, row)
  }
  return null
}

const objectUri = (ctx: any, row: OutboxRow): URL => {
  switch (row.objectType) {
    case 'vibe': return ctx.getObjectUri(Video, { id: row.objectId })
    case 'product': return ctx.getObjectUri(Note, { id: `product-${row.objectId}` })
    case 'list_item': return ctx.getObjectUri(Note, { id: `list-item-${row.objectId}` })
    default: return ctx.getObjectUri(Note, { id: row.objectId })
  }
}

/** The outbox item for a row: a Create, or an Announce for boosted items (site/space). */
/** Whether a row is a boost: space posts, and products the site boosted from a shop (`shopPosted`). */
export const isBoost = (row: OutboxRow, shopPosted: Set<string>): boolean =>
  row.objectType === 'space_post' || (row.objectType === 'product' && row.identifier === 'meeovi' && shopPosted.has(row.objectId))

export function outboxActivity(ctx: any, row: OutboxRow, shopPosted: Set<string>) {
  const object = objectUri(ctx, row)
  const actor = ctx.getActorUri(row.identifier)
  const published = Temporal.Instant.fromEpochMilliseconds(row.publishedAt.getTime())
  return isBoost(row, shopPosted)
    ? new Announce({ id: new URL(`${actor.href}#announce/${row.objectType}/${row.objectId}`), actor, object, published, to: new URL('https://www.w3.org/ns/activitystreams#Public'), cc: ctx.getFollowersUri(row.identifier) })
    : new Create({ id: new URL(`${object.href}#create`), actor, object, published, to: new URL('https://www.w3.org/ns/activitystreams#Public'), cc: ctx.getFollowersUri(row.identifier) })
}

export function setupFederation(federation: Federation<unknown>): void {
  // -- accounts ---------------------------------------------------------------
  federation
    .setActorDispatcher('/ap/actors/{identifier}', async (ctx, identifier) => {
      const info = await actorByIdentifier(identifier)
      if (!info) return null
      return actorObject(ctx, info, await ctx.getActorKeyPairs(identifier))
    })
    .mapHandle(async (_ctx, username) => identifierForHandle(username))
    .setKeyPairsDispatcher(async (_ctx, identifier) => {
      if (!parseIdentifier(identifier)) return []
      const stored = await readKeys(identifier)
      const pairs: CryptoKeyPair[] = []
      for (const keyType of KEY_TYPES) {
        let key = stored.find((k) => k.keyType === keyType)
        if (!key) {
          const generated = await generateCryptoKeyPair(keyType)
          await saveKey(identifier, { keyType, privateKey: await exportJwk(generated.privateKey), publicKey: await exportJwk(generated.publicKey) })
          // Another process may have saved one first: use whatever is stored.
          key = (await readKeys(identifier)).find((k) => k.keyType === keyType)
          if (!key) continue
        }
        pairs.push({ privateKey: await importJwk(key.privateKey, 'private'), publicKey: await importJwk(key.publicKey, 'public') })
      }
      return pairs
    })

  // -- followers --------------------------------------------------------------
  federation
    .setFollowersDispatcher('/ap/actors/{identifier}/followers', async (_ctx, identifier, cursor) => {
      if (!(await actorByIdentifier(identifier))) return null
      const page = await listFollowers(identifier, cursor === '' ? null : cursor, PAGE)
      return {
        items: page.items.map((f) => ({
          id: new URL(f.actorUri),
          inboxId: new URL(f.inboxUrl),
          endpoints: f.sharedInboxUrl ? { sharedInbox: new URL(f.sharedInboxUrl) } : null,
        })),
        nextCursor: page.next,
      }
    })
    .setCounter(async (_ctx, identifier) => countFollowers(identifier))
    .setFirstCursor(() => '')

  // -- outbox -------------------------------------------------------------------
  federation
    .setOutboxDispatcher('/ap/actors/{identifier}/outbox', async (ctx, identifier, cursor) => {
      if (!(await actorByIdentifier(identifier))) return null
      const rows = await liveOutbox({ identifier, limit: PAGE + 1, before: cursor || null })
      const items = rows.slice(0, PAGE)
      const shopPosted = await shopPostedProducts(items.filter((r) => r.objectType === 'product').map((r) => r.objectId))
      return {
        items: items.map((row) => outboxActivity(ctx, row, shopPosted)),
        nextCursor: rows.length > PAGE ? items[items.length - 1]!.publishedAt.toISOString() : null,
      }
    })
    .setCounter(async (_ctx, identifier) => countOutbox(identifier))
    .setFirstCursor(() => '')

  // -- objects -------------------------------------------------------------------
  federation.setObjectDispatcher(Note, '/ap/notes/{id}', async (ctx, { id }) => noteById(ctx, id))
  federation.setObjectDispatcher(Video, '/ap/vibez/{id}', async (ctx, { id }) => {
    const vibe = await publishedVibe(id)
    if (!vibe?.creator_id) return null
    const identifier = memberIdentifier(String(vibe.creator_id))
    if (!(await actorByIdentifier(identifier))) return null
    return vibeObject(ctx, identifier, vibe, await vibeProducts(vibe.id))
  })

  // -- inbox ----------------------------------------------------------------------
  federation
    .setInboxListeners('/ap/actors/{identifier}/inbox', '/ap/inbox')
    .on(Follow, async (ctx, follow) => {
      if (!follow.id || !follow.actorId || !follow.objectId) return
      const target = ctx.parseUri(follow.objectId)
      if (target?.type !== 'actor') return
      const info = await actorByIdentifier(target.identifier)
      if (!info) return
      const follower = await follow.getActor(ctx)
      if (!follower?.id || !follower.inboxId) return
      await addFollower({
        identifier: info.identifier,
        actorUri: follower.id.href,
        followId: follow.id.href,
        handle: follower.preferredUsername ? `@${follower.preferredUsername}@${follower.id.host}` : null,
        name: follower.name?.toString() ?? null,
        url: follower.url instanceof URL ? follower.url.href : (follower.url as any)?.href?.href ?? null,
        inboxUrl: follower.inboxId.href,
        sharedInboxUrl: follower.endpoints?.sharedInbox?.href ?? null,
      })
      // A minimal Follow in the Accept: Pixelfed rejects a full embedded one.
      await ctx.sendActivity({ identifier: info.identifier }, follower, new Accept({
        id: new URL(`${ctx.getActorUri(info.identifier).href}#accepts/${encodeURIComponent(follow.id.href)}`),
        actor: ctx.getActorUri(info.identifier),
        object: new Follow({ id: follow.id, actor: follow.actorId, object: follow.objectId }),
      }))
    })
    .on(Undo, async (ctx, undo) => {
      if (!undo.actorId) return
      const object = await undo.getObject(ctx).catch(() => null)
      if (object instanceof Follow) {
        const target = object.objectId ? ctx.parseUri(object.objectId) : null
        if (target?.type === 'actor') await removeFollower(target.identifier, undo.actorId.href)
      } else if ((object instanceof Like || object instanceof Announce) && object.id) {
        await onUndoInteraction(object.id.href, undo.actorId.href)
      } else if (undo.objectId) {
        // The undone activity can't be fetched any more: try it as a like/boost id.
        await onUndoInteraction(undo.objectId.href, undo.actorId.href)
      }
    })
    .on(Like, async (ctx, like) => onLike(ctx, like, 'like'))
    .on(Announce, async (ctx, announce) => onLike(ctx, announce, 'announce'))
    .on(Create, async (ctx, create) => {
      const object = await create.getObject(ctx).catch(() => null)
      if (object instanceof Note && create.actorId) await onReply(ctx, create, object)
    })
    .on(Update, async () => {
      // Edits of remote replies aren't carried over (the reply already sits in the discussion).
    })
    .on(Delete, async (ctx, del) => onRemoteDelete(ctx, del))
    .on(Flag, async (ctx, flag) => onFlag(ctx, flag))
    .onError((_ctx, error) => {
      console.warn('[activitypub] inbox error:', (error as Error)?.message || error)
    })

  // -- NodeInfo -----------------------------------------------------------------
  federation.setNodeInfoDispatcher('/nodeinfo/2.1', async () => ({
    software: { name: 'meeovi', version: '1.0.0', homepage: new URL(siteOrigin()) },
    protocols: ['activitypub'],
    openRegistrations: true,
    usage: { users: {}, localPosts: 0, localComments: 0 },
    metadata: { nodeName: 'Meeovi', nodeDescription: 'The decentralized social shopping network.' },
  }))
}

export { isActor, Tombstone }
