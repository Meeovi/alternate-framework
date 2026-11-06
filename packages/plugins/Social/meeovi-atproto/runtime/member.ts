// A member's own Bluesky session as a FederationMemberSession: their
// timeline, notes, likes, reposts, follows and lists (Bluesky lists of
// accounts — "curate lists"), all done as them through their stored AT
// Protocol session. The social layer hands over the credentials (it keeps
// them in atproto_sessions); this file never touches the site's database.
import { AtprotoClient, type AtprotoActorRecord, type AtprotoListRecord } from './client'
import { toFederatedActor, toFederatedPost } from './network'
import { isHiddenByModeration } from './moderation'
import { restoreOAuthAgent } from './oauth'
import { linkCardEmbed } from './linkcard'
import type {
  FederatedList,
  FederatedListItem,
  FederationMember,
  FederationMemberSession,
} from './federation'

const NETWORK = 'atproto'
const CURATE = 'app.bsky.graph.defs#curatelist'

export type AtprotoCredentials = {
  service: string
  session: { did: string, handle: string, accessJwt: string, refreshJwt: string }
}

const isCredentials = (value: unknown): value is AtprotoCredentials => {
  const c = value as AtprotoCredentials | undefined
  return !!c?.service && !!c.session?.did && !!c.session.accessJwt && !!c.session.refreshJwt
}

/** A Bluesky list as the contract's list (Bluesky lists hold accounts). */
export function toFederatedList(list: AtprotoListRecord): FederatedList {
  return {
    id: list.uri,
    network: NETWORK,
    name: list.name,
    description: list.description || undefined,
    kind: 'accounts',
    visibility: 'public',
    avatar: list.avatar || undefined,
    itemCount: list.itemCount,
    path: `/lists/list/${encodeURIComponent(`atproto:${list.uri}`)}`,
    url: blueskyListUrl(list.uri),
  }
}

/** at://<did>/app.bsky.graph.list/<rkey> → its page on bsky.app (shown on
 *  Meeovi as the list's source). */
export function blueskyListUrl(uri: string): string | undefined {
  const match = /^at:\/\/([^/]+)\/app\.bsky\.graph\.list\/([^/]+)$/.exec(uri)
  return match ? `https://bsky.app/profile/${match[1]}/lists/${match[2]}` : undefined
}

/** The member's session on Bluesky, or null when they have none. */
export async function atprotoMemberSession(member: FederationMember): Promise<FederationMemberSession | null> {
  // Signed in with Bluesky OAuth: act through that session (it refreshes
  // itself in the OAuth session store).
  const oauth = member.credentials as { oauth?: boolean, did?: string, handle?: string } | undefined
  if (oauth?.oauth && oauth.did) {
    const agent = await restoreOAuthAgent(oauth.did)
    if (!agent) return null
    return createAtprotoMemberSession(new AtprotoClient({ agent, identity: { did: oauth.did, handle: oauth.handle || oauth.did } }))
  }
  if (!isCredentials(member.credentials)) return null
  const { service, session } = member.credentials
  let client: AtprotoClient
  try {
    client = await AtprotoClient.create({
      serviceUrl: service,
      session: { ...session, active: true },
      onSessionChange: (_event, next) => {
        if (!next || !member.saveCredentials) return
        member.saveCredentials({ service, session: { did: next.did, handle: next.handle, accessJwt: next.accessJwt, refreshJwt: next.refreshJwt } })
          .catch((error) => console.error('[meeovi-atproto] could not save a refreshed session', error))
      },
    })
  } catch (error: any) {
    // Expired or revoked: the member has to sign in with Bluesky again.
    console.warn('[meeovi-atproto] stored session for', member.id, 'no longer works:', error?.message)
    return null
  }
  return createAtprotoMemberSession(client)
}

/** The session over an already signed-in client (exported for tests). */
export function createAtprotoMemberSession(client: AtprotoClient): FederationMemberSession {
  const me = (): AtprotoActorRecord => ({ did: client.did!, handle: client.handle! } as AtprotoActorRecord)

  const post = async (id: string) => {
    const found = await client.getPost(id)
    if (!found) throw Object.assign(new Error('Note not found'), { statusCode: 404, statusMessage: 'Note not found' })
    return found
  }

  return {
    network: NETWORK,
    account: toFederatedActor(me()),

    async timeline({ limit = 30 } = {}) {
      // Notes moderation hides stay out of members' timelines too.
      return (await client.getTimeline({ limit })).posts.map(toFederatedPost).filter((post) => !isHiddenByModeration(post.moderation))
    },

    async publish({ text, replyTo, card, langs }) {
      // A reply names its parent and the thread's root (the parent itself
      // when replying to a top-level note).
      const parent = replyTo ? await post(replyTo) : null
      const root = parent?.replyRootUri ? await post(parent.replyRootUri) : parent
      const created = await client.createPost({
        text,
        ...(langs?.length ? { langs } : {}),
        ...(card ? { externalEmbed: await linkCardEmbed(client, card) } : {}),
        ...(parent && root ? { replyParentUri: parent.uri, replyParentCid: parent.cid, replyRootUri: root.uri, replyRootCid: root.cid } : {}),
      })
      return toFederatedPost(created)
    },

    async unpublish(id) {
      // Only the member's own notes (at://<their did>/app.bsky.feed.post/…).
      if (!id.startsWith(`at://${client.did}/app.bsky.feed.post/`)) {
        throw Object.assign(new Error('Not your note'), { statusCode: 403, statusMessage: 'You can only delete your own notes' })
      }
      await client.deletePost(id)
    },

    async like(id) {
      const target = await post(id)
      if (!target.viewer?.likeUri) await client.like(target.uri, target.cid)
    },
    async unlike(id) {
      const target = await post(id)
      if (target.viewer?.likeUri) await client.unlike(target.viewer.likeUri)
    },
    async repost(id) {
      const target = await post(id)
      if (!target.viewer?.repostUri) await client.repost(target.uri, target.cid)
    },
    async unrepost(id) {
      const target = await post(id)
      if (target.viewer?.repostUri) await client.unrepost(target.viewer.repostUri)
    },

    async follow(actor) {
      const profile = await client.getProfile(actor)
      if (!profile.viewer?.following) await client.follow(profile.did)
    },
    async unfollow(actor) {
      const profile = await client.getProfile(actor)
      if (profile.viewer?.following) await client.unfollow(profile.viewer.following)
    },

    async lists() {
      const { lists } = await client.getLists(client.did!, { limit: 100 })
      return lists.filter((l) => l.purpose === CURATE).map(toFederatedList)
    },
    async list(id) {
      const found = await client.getList(id)
      if (!found) return null
      return {
        list: toFederatedList({ ...found.list, itemCount: found.list.itemCount ?? found.items.length }),
        items: found.items.map((item): FederatedListItem => ({ id: item.uri, kind: 'account', actor: toFederatedActor(item.subject) })),
      }
    },
    async createList({ name, description }) {
      const { listUri } = await client.createList({ name, description, purpose: CURATE })
      return toFederatedList({ uri: listUri, cid: '', name, description, purpose: CURATE, itemCount: 0 })
    },
    async updateList(id, { name, description }) {
      await client.updateList(id, { name, description })
      const found = await client.getList(id, { limit: 1 })
      if (!found) throw Object.assign(new Error('List not found'), { statusCode: 404, statusMessage: 'List not found' })
      return toFederatedList(found.list)
    },
    async deleteList(id) {
      await client.deleteList(id)
    },
    async addToList(listId, item) {
      if (item.kind !== 'account' || !('actor' in item)) {
        throw Object.assign(new Error('Bluesky lists hold accounts'), { statusCode: 400, statusMessage: 'Bluesky lists can only hold accounts' })
      }
      const profile = await client.getProfile(item.actor)
      const { itemUri } = await client.addListItem(listId, profile.did)
      return { id: itemUri, kind: 'account', actor: toFederatedActor(profile), addedAt: new Date().toISOString() }
    },
    async removeFromList(_listId, itemId) {
      await client.removeListItem(itemId)
    },
  }
}
