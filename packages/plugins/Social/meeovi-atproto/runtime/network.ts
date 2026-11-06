// AT Protocol (Bluesky) as a federation network for the social
// layer (see runtime/federation.ts). Reads go through the service-account
// client that bootstrap.ts signs in — this deployment's PDS requires a
// session even for search — or an unauthenticated client against the same
// service when no service account is configured.
import { AtprotoClient, getAtprotoServiceUrl, type AtprotoActorRecord, type AtprotoPostRecord } from './client'
import { type FederatedActor, type FederatedListItem, type FederatedPost, type FederatedReport, type FederationNetwork } from './federation'
import { atprotoMemberSession, toFederatedList } from './member'
import { isHiddenByModeration, meeoviLabelerDid, moderate } from './moderation'

const NETWORK = 'atproto'

export function toFederatedActor(actor: AtprotoActorRecord): FederatedActor {
  return {
    id: actor.did,
    network: NETWORK,
    handle: actor.handle,
    displayName: actor.displayName || undefined,
    avatar: actor.avatar || undefined,
    bio: actor.description || undefined,
    url: `https://bsky.app/profile/${actor.handle}`,
    followers: actor.followersCount,
    following: actor.followsCount,
    posts: actor.postsCount,
    labels: actor.labels?.length ? actor.labels : undefined,
    moderation: moderate(actor.labels) ?? undefined,
  }
}

export function toFederatedPost(post: AtprotoPostRecord): FederatedPost {
  return {
    id: post.uri,
    network: NETWORK,
    url: `https://bsky.app/profile/${post.authorHandle}/post/${post.uri.split('/').pop()}`,
    text: post.text,
    createdAt: post.createdAt,
    author: {
      id: post.authorDid,
      network: NETWORK,
      handle: post.authorHandle,
      displayName: post.authorDisplayName || undefined,
      avatar: post.authorAvatar || undefined,
      url: `https://bsky.app/profile/${post.authorHandle}`,
    },
    media: (post.images ?? []).map((img) => ({ url: img.fullsize, preview: img.thumb, alt: img.alt, type: 'image' as const })),
    hashtags: post.hashtags,
    replies: post.replyCount,
    reposts: post.repostCount,
    likes: post.likeCount,
    labels: post.labels?.length || post.authorLabels?.length ? [...new Set([...(post.labels ?? []), ...(post.authorLabels ?? [])])] : undefined,
    // The note's labels and its author's (an account labelled spam hides its notes too).
    moderation: moderate(post.labels, post.authorLabels) ?? undefined,
  }
}

/** Notes and accounts that moderation hides are left out of every answer. */
const REASON_TYPES: Record<FederatedReport['reasonType'], string> = {
  spam: 'com.atproto.moderation.defs#reasonSpam',
  violation: 'com.atproto.moderation.defs#reasonViolation',
  misleading: 'com.atproto.moderation.defs#reasonMisleading',
  sexual: 'com.atproto.moderation.defs#reasonSexual',
  rude: 'com.atproto.moderation.defs#reasonRude',
  other: 'com.atproto.moderation.defs#reasonOther',
}
const POST_URI = /^at:\/\/(did:[a-z]+:[A-Za-z0-9._:%-]+)\/app\.bsky\.feed\.post\/[A-Za-z0-9._:~-]+$/
const DID = /^did:(plc|web):[A-Za-z0-9._:%-]+$/

const shown = <T extends { moderation?: { action: string } }>(items: T[]): T[] => items.filter((item) => !isHiddenByModeration(item.moderation as any))

export function createAtprotoNetwork(options: { service?: string, configured?: boolean } = {}): FederationNetwork {
  const service = options.service || getAtprotoServiceUrl()
  let anonymous: AtprotoClient | null = null
  const client = (): AtprotoClient =>
    ((globalThis as any).__atprotoClient as AtprotoClient | undefined)
    ?? (anonymous ??= new AtprotoClient({ serviceUrl: service }))

  // A PDS that requires a session for reads (this deployment's does)
  // rejects the anonymous client: report "not connected" rather than an
  // outage, and tell the operator what's missing.
  const read = async <T>(fn: (c: AtprotoClient) => Promise<T>): Promise<T> => {
    const c = client()
    try {
      return await fn(c)
    } catch (e: any) {
      if (!c.session && (e?.error === 'AuthMissing' || /authentication required/i.test(e?.message || ''))) {
        console.warn(`[meeovi-atproto] ${service} needs a signed-in session for reads — set ATPROTO_IDENTIFIER / ATPROTO_APP_PASSWORD`)
        throw Object.assign(new Error('Bluesky is not connected'), { statusCode: 503, statusMessage: "Bluesky isn't connected on this site yet" })
      }
      throw e
    }
  }

  return {
    id: NETWORK,
    label: 'Bluesky',
    async status() {
      const c = client()
      try {
        await c.describeServer()
        return {
          configured: Boolean(options.configured),
          connected: true,
          service,
          account: c.handle ?? null,
          ...(c.session ? {} : { detail: 'Not signed in: reads are anonymous (set ATPROTO_IDENTIFIER / ATPROTO_APP_PASSWORD if this PDS requires a session)' }),
        }
      } catch (e: any) {
        // An AppView doesn't implement describeServer (a PDS method), but
        // answering at all means it's up.
        const answered = e?.status === 501 || /not implemented/i.test(e?.message || '')
        return { configured: Boolean(options.configured), connected: answered, service, account: c.handle ?? null, detail: answered ? 'AppView' : e?.message }
      }
    },
    async profile(handle) {
      try {
        const actor = toFederatedActor(await read((c) => c.getProfile(handle)))
        // Hidden by moderation: as if it weren't there.
        return isHiddenByModeration(actor.moderation) ? null : actor
      } catch (e: any) {
        if (e?.statusCode === 503) throw e
        // Unknown handle / DID → not found rather than an outage.
        if (e?.status === 400 || /not found|could not find|resolve/i.test(e?.message || '')) return null
        throw e
      }
    },
    async feed(actor, { limit = 20 } = {}) {
      const { posts } = await read((c) => c.getAuthorFeed({ handle: actor, limit }))
      return shown(posts.map(toFederatedPost))
    },
    async thread(author, key, { limit = 50 } = {}) {
      // at://<did>/app.bsky.feed.post/<rkey>; a handle is turned into its
      // DID first (through its profile: AppViews only accept DIDs in post
      // URIs, and don't all answer resolveHandle).
      if (!/^[A-Za-z0-9._:~-]{1,512}$/.test(key)) return null
      try {
        const did = author.startsWith('did:') ? author : (await read((c) => c.getProfile(author))).did
        const found = await read((c) => c.getPostWithReplies(`at://${did}/app.bsky.feed.post/${key}`, { limit }))
        if (!found) return null
        const post = toFederatedPost(found.post)
        return isHiddenByModeration(post.moderation) ? null : { post, replies: shown(found.replies.map(toFederatedPost)) }
      } catch (e: any) {
        if (e?.statusCode === 503) throw e
        if (e?.status === 400 || /not found|could not find|resolve/i.test(e?.message || '')) return null
        throw e
      }
    },
    // A public Bluesky list of accounts (curate list) by its at:// URI, for
    // its page on Meeovi (/lists/list/atproto:<uri>).
    async list(id, { limit = 100 } = {}) {
      if (!/^at:\/\/[^/]+\/app\.bsky\.graph\.list\/[A-Za-z0-9._:~-]+$/.test(id)) return null
      const found = await read((c) => c.getList(id, { limit }))
      if (!found || found.list.purpose !== 'app.bsky.graph.defs#curatelist') return null
      return {
        list: toFederatedList({ ...found.list, itemCount: found.list.itemCount ?? found.items.length }),
        items: found.items
          .map((item): FederatedListItem => ({ id: item.uri, kind: 'account', actor: toFederatedActor(item.subject) }))
          .filter((item) => !isHiddenByModeration(item.actor?.moderation)),
      }
    },
    // A member's own Bluesky session (stored by the atproto sign-in;
    // handed over by the social layer).
    forMember: atprotoMemberSession,
    // A report in Meeovi's Ozone (ATPROTO_LABELER_DID), filed by the service
    // account through its PDS (atproto-proxy to the labeler's
    // #atproto_labeler service). Needs the labeler declared in its DID
    // document; until then the PDS can't route it and this throws.
    async report({ subject, reasonType, reason }) {
      const labeler = meeoviLabelerDid()
      const c = (globalThis as any).__atprotoClient as AtprotoClient | undefined
      if (!labeler || !c?.session) {
        throw Object.assign(new Error('Reporting is not set up'), { statusCode: 503, statusMessage: "Reporting to moderators isn't set up yet" })
      }
      let target: Record<string, unknown>
      if (subject.kind === 'note') {
        const uri = String(subject.id).replace(/^atproto:(?=at:\/\/)/, '')
        if (!POST_URI.test(uri)) throw Object.assign(new Error('Not a Bluesky note'), { statusCode: 400, statusMessage: 'Not a Bluesky note' })
        // A record report names the exact version (cid).
        const { data } = await c.agent.getPosts({ uris: [uri] })
        const cid = data.posts[0]?.cid
        if (!cid) throw Object.assign(new Error('Note not found'), { statusCode: 404, statusMessage: 'That note no longer exists' })
        target = { $type: 'com.atproto.repo.strongRef', uri, cid }
      } else {
        const did = String(subject.id).replace(/^atproto:/, '')
        if (!DID.test(did)) throw Object.assign(new Error('Not a Bluesky account'), { statusCode: 400, statusMessage: 'Not a Bluesky account' })
        target = { $type: 'com.atproto.admin.defs#repoRef', did }
      }
      try {
        const { data } = await c.agent.withProxy('atproto_labeler', labeler).com.atproto.moderation.createReport({
          reasonType: REASON_TYPES[reasonType] ?? REASON_TYPES.other,
          reason: reason?.slice(0, 2000),
          subject: target as any,
        })
        return { id: String(data.id) }
      } catch (error: any) {
        // The labeler's DID document has no #atproto_labeler service yet
        // (Ozone not set up as a labeler): the PDS can't route the report.
        if (/resolve proxy|atproto_labeler|service url/i.test(error?.message || '')) {
          console.error('[meeovi-atproto] report: the labeler', labeler, "isn't reachable through the PDS:", error.message)
          throw Object.assign(new Error(error.message), { statusCode: 503, statusMessage: "Meeovi's moderation service isn't connected yet. Please try again later." })
        }
        throw error
      }
    },
    async searchPosts(query, { limit = 20 } = {}) {
      const { posts } = await read((c) => c.searchPosts({ query, limit, sort: 'latest' }))
      return shown(posts.map(toFederatedPost))
    },
  }
}
