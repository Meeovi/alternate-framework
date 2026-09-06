// layers/social/service/socialFederation.ts

import { useFederation as useMastoFederation } from '@mframework/adapter-federation/runtime/composables/useFederation'
import type { mastodon } from '@mframework/adapter-federation/clients/mastodon'
import { useAtprotoClient } from '@mframework/adapter-federation/clients/atproto'
import type { AtprotoPostRecord as AtprotoClientPostRecord } from '@mframework/adapter-federation/clients/atproto'

export type FederationProtocol = 'activitypub' | 'atproto'

export type ActivityPubVisibility = 'public' | 'unlisted' | 'private' | 'direct'
export type AtProtoVisibility = 'public' | 'followers' | 'lists' | 'private'

export interface FederatedAuthor {
  handle: string
  displayName?: string
  avatarUrl?: string
}

export interface FederatedPost {
  id: string
  protocol: FederationProtocol
  content: string
  author: FederatedAuthor
  visibility: ActivityPubVisibility | AtProtoVisibility
  createdAt: string
  hashtags?: string[]
  url?: string
  inReplyToId?: string | null
  quotedPostId?: string | null
  poll?: {
    options: string[]
    expiresAt: string
    multiple?: boolean
    hideTotals?: boolean
  } | null
}

export type ActivityPubPostPayload = {
  protocol: 'activitypub'
  content: string
  hashtags?: string[]
  visibility: ActivityPubVisibility
  inReplyToId?: string | null
  quotedStatusId?: string | null
  poll?: {
    options: string[]
    expiresIn: number
    multiple?: boolean
    hideTotals?: boolean
  } | null
}

export type AtProtoPostPayload = {
  protocol: 'atproto'
  content: string
  hashtags?: string[]
  visibility: AtProtoVisibility
  listId?: string | null
  inReplyToUri?: string | null
  quotedUri?: string | null
  poll?: {
    options: string[]
    expiresAt: string
    multiple?: boolean
    hideTotals?: boolean
  } | null
}

export type FederatedPostPayload = ActivityPubPostPayload | AtProtoPostPayload

// MASTODON NORMALIZATION

const normalizeMastoStatus = (status: mastodon.v1.Status): FederatedPost => {
  const hashtags = status.tags?.map((t: { name: any }) => t.name) || []
  // Mastodon's real Poll entity has no hideTotals field (it's an input-only
  // concept at creation time, never echoed back on the response), and
  // expiresAt can be null/absent even though FederatedPost.poll requires a
  // string — so it's defaulted rather than passed through as-is.
  const poll = status.poll
    ? {
        options: status.poll.options.map((o: { title: any }) => o.title),
        expiresAt: status.poll.expiresAt || '',
        multiple: status.poll.multiple
      }
    : null

  return {
    id: status.id,
    protocol: 'activitypub',
    content: status.content,
    author: {
      handle: status.account.acct,
      displayName: status.account.displayName || status.account.username,
      avatarUrl: status.account.avatar
    },
    visibility: status.visibility as ActivityPubVisibility,
    createdAt: status.createdAt,
    hashtags,
    url: status.url ?? undefined,
    inReplyToId: status.inReplyToId || null,
    quotedPostId: (status as any).quotedStatusId || null,
    poll
  }
}

// ATPROTO CLIENT + NORMALIZATION
//
// AtprotoPostRecord itself (uri/cid/text/author.../hashtags/reply/quote/...)
// is defined once in @mframework/adapter-federation/clients/atproto — see
// AtprotoClientPostRecord above — rather than duplicated here.

const normalizeAtprotoPost = (record: AtprotoClientPostRecord): FederatedPost => {
  return {
    id: record.uri,
    protocol: 'atproto',
    content: record.text,
    author: {
      handle: record.authorHandle,
      displayName: record.authorDisplayName,
      avatarUrl: record.authorAvatar
    },
    visibility: record.visibility,
    createdAt: record.createdAt,
    hashtags: record.hashtags || [],
    url: record.uri,
    inReplyToId: record.replyParentUri || null,
    quotedPostId: record.quoteUri || null,
    poll: record.poll || null
  }
}

export const useSocialFederation = () => {
  const mastoState = (globalThis as any).__mastoState as {
    client: mastodon.rest.Client
    streamingClient?: mastodon.streaming.Client
  } | undefined

  const mastoFederation = mastoState
    ? useMastoFederation({
        client: shallowRef<mastodon.rest.Client>(mastoState.client),
        streamingClient: shallowRef<mastodon.streaming.Client | undefined>(
          mastoState.streamingClient
        )
      } as any)
    : null

  const atproto = useAtprotoClient()

  const getFederatedPosts = async (opts?: {
    protocol?: FederationProtocol
    hashtag?: string
    limit?: number
  }): Promise<FederatedPost[]> => {
    if (!opts?.protocol || opts.protocol === 'activitypub') {
      if (!mastoFederation) return []
      const statuses = await mastoFederation.getRawPosts({
        hashtag: opts?.hashtag,
        limit: opts?.limit
      })
      return statuses.map(normalizeMastoStatus)
    }

    const { posts } = await atproto.getTimeline({
      hashtag: opts?.hashtag,
      limit: opts?.limit
    })
    return posts.map(normalizeAtprotoPost)
  }

  const getFederatedUserFeed = async (
    userHandle: string,
    opts?: { protocol?: FederationProtocol; limit?: number }
  ): Promise<FederatedPost[]> => {
    if (!opts?.protocol || opts.protocol === 'activitypub') {
      if (!mastoFederation) return []
      const statuses = await mastoFederation.getRawUserFeed({
        userHandle,
        limit: opts?.limit
      })
      return statuses.map(normalizeMastoStatus)
    }

    const { posts } = await atproto.getAuthorFeed({
      handle: userHandle,
      limit: opts?.limit
    })
    return posts.map(normalizeAtprotoPost)
  }

  const createFederatedPost = async (
    payload: FederatedPostPayload
  ): Promise<FederatedPost> => {
    if (payload.protocol === 'activitypub') {
      if (!mastoFederation) throw new Error('Mastodon federation not initialized')

      const res = await mastoFederation.createRawPost({
        content: payload.content,
        visibility: payload.visibility as mastodon.v1.StatusVisibility,
        hashtags: payload.hashtags
      })

      return normalizeMastoStatus(res)
    }

    // AtprotoClient.createPost auto-detects #hashtags/links/mentions
    // straight out of `text` (RichText.detectFacets) rather than taking a
    // separate hashtags array — append any not already inline, same as
    // publishPostToFederation below does for its own local-post hashtags.
    const missingHashtags = (payload.hashtags || []).filter(tag => !payload.content.includes(`#${tag}`))
    const text = missingHashtags.length
      ? `${payload.content}\n\n${missingHashtags.map(tag => `#${tag}`).join(' ')}`
      : payload.content

    const record = await atproto.createPost({
      text,
      visibility: payload.visibility,
      replyParentUri: payload.inReplyToUri || null,
      quoteUri: payload.quotedUri || null
    })

    return normalizeAtprotoPost(record)
  }

  const publishPostToFederation = async (
    localPost: { id: string | number; content: string; hashtags?: string[] },
    protocol: FederationProtocol,
    visibility: ActivityPubVisibility | AtProtoVisibility
  ): Promise<FederatedPost> => {
    const baseContent =
      localPost.hashtags && localPost.hashtags.length
        ? `${localPost.content}\n\n${localPost.hashtags.map(h => `#${h}`).join(' ')}`
        : localPost.content

    if (protocol === 'activitypub') {
      if (!mastoFederation) throw new Error('Mastodon federation not initialized')

      const res = await mastoFederation.createRawPost({
        content: baseContent,
        visibility: visibility as mastodon.v1.StatusVisibility,
        hashtags: localPost.hashtags
      })

      return normalizeMastoStatus(res)
    }

    const record = await atproto.createPost({
      text: baseContent,
      visibility: visibility as AtProtoVisibility
    })

    return normalizeAtprotoPost(record)
  }

  return {
    getFederatedPosts,
    getFederatedUserFeed,
    createFederatedPost,
    publishPostToFederation
  }
}
