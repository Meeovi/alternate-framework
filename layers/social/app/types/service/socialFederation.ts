// layers/social/service/socialFederation.ts

import { useFederation as useMastoFederation } from '@mframework/adapter-federation/runtime/composables/useFederation'
import type { mastodon } from '@mframework/adapter-federation/clients/mastodon'
import { useAtprotoClient } from '@mframework/adapter-federation/clients/atproto' // scaffolded ATProto client

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
  const poll = status.poll
    ? {
        options: status.poll.options.map((o: { title: any }) => o.title),
        expiresAt: status.poll.expiresAt,
        multiple: status.poll.multiple,
        hideTotals: status.poll.hideTotals
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
    url: status.url,
    inReplyToId: status.inReplyToId || null,
    quotedPostId: (status as any).quotedStatusId || null,
    poll
  }
}

// ATPROTO CLIENT + NORMALIZATION (SCAFFOLDED)

export interface AtprotoPostRecord {
  uri: string
  cid: string
  text: string
  createdAt: string
  authorHandle: string
  authorDisplayName?: string
  authorAvatar?: string
  visibility: AtProtoVisibility
  hashtags?: string[]
  replyParentUri?: string | null
  quoteUri?: string | null
  poll?: {
    options: string[]
    expiresAt: string
    multiple?: boolean
    hideTotals?: boolean
  } | null
}

const normalizeAtprotoPost = (record: AtprotoPostRecord): FederatedPost => {
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

    const records = await atproto.getTimeline({
      hashtag: opts?.hashtag,
      limit: opts?.limit
    })
    return records.map(normalizeAtprotoPost)
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

    const records = await atproto.getUserFeed({
      handle: userHandle,
      limit: opts?.limit
    })
    return records.map(normalizeAtprotoPost)
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

    const record = await atproto.createPost({
      text: payload.content,
      visibility: payload.visibility,
      hashtags: payload.hashtags,
      replyParentUri: payload.inReplyToUri || null,
      quoteUri: payload.quotedUri || null,
      poll: payload.poll || null
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
      visibility: visibility as AtProtoVisibility,
      hashtags: localPost.hashtags
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
