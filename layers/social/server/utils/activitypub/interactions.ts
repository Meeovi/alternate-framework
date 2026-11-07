import { createDirectus, createItem, rest, staticToken } from '@directus/sdk'
import { Note, Video, getActorHandle, type Announce, type Delete, type Flag, type Like, type Create } from '@fedify/vocab'
import { checkSpam } from '#shared/server/utils/spam'
import { deleteMessage, postAsAlias } from '@mframework/meeovi-discussions/server'
import { toPlainText } from '../federation-directus'
import { actorByIdentifier } from './actors'
import { findPublished, recordInteraction, removeFollowerEverywhere, removeInteraction, removeReply, type ObjectType } from './store'
import { db } from '#auth/server/utils/drizzle'
import { apInteractions } from '#auth/server/database/migrations/schema'
import { and, eq } from 'drizzle-orm'

/**
 * What the fediverse sends back to Meeovi items: likes and boosts (counted),
 * replies (counted, and posted into the item's discussion after the same
 * spam check as Meeovi comments), deletions, and reports (saved in the
 * Directus `report` collection with the rest).
 */

export type LocalItem = { objectType: ObjectType, objectId: string }

/** One of our object URIs → the Meeovi item ('note' 12, 'product' 45, 'vibe' 7, 'list_item' 9). */
export function localItem(ctx: { parseUri: (uri: URL | null) => any }, uri: URL | null): LocalItem | null {
  const parsed = uri ? ctx.parseUri(uri) : null
  if (parsed?.type !== 'object') return null
  const id = String(parsed.values?.id ?? '')
  if (parsed.class === Video) return /^\d{1,12}$/.test(id) ? { objectType: 'vibe', objectId: id } : null
  if (parsed.class !== Note) return null
  if (/^\d{1,12}$/.test(id)) return { objectType: 'note', objectId: id }
  const product = /^product-(\d{1,18})$/.exec(id)
  if (product) return { objectType: 'product', objectId: product[1]! }
  const item = /^list-item-(\d{1,12})$/.exec(id)
  if (item) return { objectType: 'list_item', objectId: item[1]! }
  return null
}

/** The discussion room an item's replies go to (pages' <MeeoviDiscussion> types). */
const DISCUSSION_TYPE: Partial<Record<ObjectType, string>> = { note: 'post', product: 'product', vibe: 'vibe' }

async function handleOf(actor: any): Promise<string> {
  try {
    return await getActorHandle(actor)
  } catch {
    return actor?.id?.href ?? 'someone on the fediverse'
  }
}

export async function onLike(ctx: any, activity: Like | Announce, kind: 'like' | 'announce'): Promise<void> {
  if (!activity.id || !activity.actorId) return
  const item = localItem(ctx, activity.objectId)
  if (!item || !(await findPublished(item.objectType, item.objectId))) return
  await recordInteraction({
    kind, ...item, actorUri: activity.actorId.href, activityId: activity.id.href,
    actorHandle: `@${activity.actorId.host}`, objectUri: activity.objectId?.href ?? null,
  })
}

export async function onUndoInteraction(activityId: string, actorUri: string): Promise<void> {
  await removeInteraction(activityId, actorUri)
}

export async function onReply(ctx: any, create: Create, note: Note): Promise<void> {
  if (!create.id || !create.actorId || !note.id) return
  // Only the note's own author may post it.
  if (note.attributionId && note.attributionId.href !== create.actorId.href) return
  const item = localItem(ctx, note.replyTargetId)
  if (!item || !(await findPublished(item.objectType, item.objectId))) return

  const text = toPlainText(note.content?.toString() ?? '').slice(0, 2000)
  if (!text) return
  const actor = await create.getActor(ctx).catch(() => null)
  const handle = actor ? await handleOf(actor) : create.actorId.href
  const published = actor?.published ? Number(actor.published.epochMilliseconds) : NaN
  const verdict = checkSpam(text, {
    authorId: `ap:${create.actorId.href}`,
    scope: `${item.objectType}:${item.objectId}`,
    accountAgeHours: Number.isFinite(published) ? (Date.now() - published) / 3_600_000 : null,
  })
  if (verdict.spam) {
    console.warn(`[activitypub] spam reply from ${handle} on ${item.objectType} ${item.objectId}: ${verdict.reasons.join(', ')}`)
    return
  }

  const fresh = await recordInteraction({
    kind: 'reply', ...item, actorUri: create.actorId.href, actorHandle: handle,
    activityId: create.id.href, objectUri: note.id.href, content: text,
  })
  if (!fresh) return

  const type = DISCUSSION_TYPE[item.objectType]
  if (!type) return
  try {
    const link = note.url instanceof URL ? note.url.href : note.id.href
    const icon = await actor?.getIcon?.().catch(() => null)
    const avatar = icon?.url instanceof URL ? icon.url.href : undefined
    const posted = await postAsAlias(undefined, `discussion-${type}-${item.objectId}`, `${text}\n\n— via the fediverse: ${link}`, handle, { avatar })
    if (posted.messageId) {
      await db.update(apInteractions).set({ discussionMessageId: `${posted.roomId}:${posted.messageId}` })
        .where(eq(apInteractions.activityId, create.id.href))
    }
  } catch (error) {
    console.warn('[activitypub] could not post reply to the discussion:', (error as Error)?.message || error)
  }
}

export async function onRemoteDelete(_ctx: any, del: Delete): Promise<void> {
  if (!del.actorId || !del.objectId) return
  // The account itself was deleted.
  if (del.objectId.href === del.actorId.href) {
    await removeFollowerEverywhere(del.actorId.href)
    return
  }
  const [row] = await db.select({ message: apInteractions.discussionMessageId }).from(apInteractions)
    .where(and(eq(apInteractions.kind, 'reply'), eq(apInteractions.objectUri, del.objectId.href), eq(apInteractions.actorUri, del.actorId.href))).limit(1)
  if (!(await removeReply(del.objectId.href, del.actorId.href))) return
  const [roomId, messageId] = String(row?.message ?? '').split(':')
  if (roomId && messageId) await deleteMessage(undefined as any, roomId, messageId).catch(() => {})
}

/** A fediverse report (Flag) → the Directus `report` collection, like Meeovi's own. */
export async function onFlag(ctx: any, flag: Flag): Promise<void> {
  if (!flag.actorId) return
  const reason = toPlainText(flag.content?.toString() ?? '').slice(0, 1500)
  const targets: Array<{ type: string, id: string }> = []
  for (const uri of flag.objectIds) {
    const item = localItem(ctx, uri)
    if (item) { targets.push({ type: item.objectType, id: item.objectId }); continue }
    const parsed = ctx.parseUri(uri)
    if (parsed?.type === 'actor' && (await actorByIdentifier(parsed.identifier))) targets.push({ type: 'account', id: parsed.identifier })
  }
  if (!targets.length) return
  const client = createDirectus(process.env.DIRECTUS_URL!).with(rest()).with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))
  for (const target of targets.slice(0, 5)) {
    await client.request(createItem('report' as never, {
      title: `${target.type[0]!.toUpperCase()}${target.type.slice(1).replace('_', ' ')} reported from the fediverse`,
      content: [reason, `Reported by ${flag.actorId.href}`].filter(Boolean).join('\n\n'),
      network: 'activitypub',
      content_type: target.type,
      content_id: target.id,
      reporter_email: null,
    } as never)).catch((error: any) => console.warn('[activitypub] could not save a report:', error?.message || error))
  }
}
