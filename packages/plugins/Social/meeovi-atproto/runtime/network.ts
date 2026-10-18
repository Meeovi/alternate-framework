// AT Protocol (Bluesky) as a federation network for the social
// layer (see runtime/federation.ts). Reads go through the service-account
// client that bootstrap.ts signs in — this deployment's PDS requires a
// session even for search — or an unauthenticated client against the same
// service when no service account is configured.
import { AtprotoClient, getAtprotoServiceUrl, type AtprotoActorRecord, type AtprotoPostRecord } from './client'
import { type FederatedActor, type FederatedPost, type FederationNetwork } from './federation'

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
  }
}

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
        return toFederatedActor(await read((c) => c.getProfile(handle)))
      } catch (e: any) {
        if (e?.statusCode === 503) throw e
        // Unknown handle / DID → not found rather than an outage.
        if (e?.status === 400 || /not found|could not find|resolve/i.test(e?.message || '')) return null
        throw e
      }
    },
    async feed(actor, { limit = 20 } = {}) {
      const { posts } = await read((c) => c.getAuthorFeed({ handle: actor, limit }))
      return posts.map(toFederatedPost)
    },
    async searchPosts(query, { limit = 20 } = {}) {
      const { posts } = await read((c) => c.searchPosts({ query, limit, sort: 'latest' }))
      return posts.map(toFederatedPost)
    },
  }
}
