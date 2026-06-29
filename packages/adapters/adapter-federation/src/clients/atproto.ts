// packages/adapters/adapter-federation/src/clients/atproto.ts

import {
  AtpAgent,
  AppBskyFeedGetTimeline,
  AppBskyFeedGetAuthorFeed,
  AppBskyFeedPost,
  AppBskyRichtextFacet,
  AppBskyActorGetProfile,
  AppBskyFeedDefs,
} from '@atproto/api'

export interface AtprotoClientOptions {
  serviceUrl: string
  identifier: string
  password: string
}

export interface AtprotoPostRecord {
  uri: string
  cid: string
  text: string
  createdAt: string
  authorHandle: string
  authorDisplayName?: string
  authorAvatar?: string
  visibility: 'public' | 'followers' | 'lists' | 'private'
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

export interface AtprotoTimelineOptions {
  limit?: number
  cursor?: string
  hashtag?: string
}

export interface AtprotoUserFeedOptions {
  handle: string
  limit?: number
  cursor?: string
}

export interface AtprotoCreatePostOptions {
  text: string
  visibility: 'public' | 'followers' | 'lists' | 'private'
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

export class AtprotoClient {
  private agent: AtpAgent

  constructor(options: AtprotoClientOptions) {
    this.agent = new AtpAgent({ service: options.serviceUrl })
  }

  async login(identifier: string, password: string) {
    await this.agent.login({ identifier, password })
  }

  static async create(options: AtprotoClientOptions) {
    const client = new AtprotoClient(options)
    await client.login(options.identifier, options.password)
    return client
  }

  private normalizeFeedPost(
    post: AppBskyFeedDefs.FeedViewPost
  ): AtprotoPostRecord | null {
    const record = post.post.record as AppBskyFeedPost.Record
    if (!record || typeof record.text !== 'string') return null

    const text = record.text
    const createdAt = record.createdAt
    const uri = post.post.uri
    const cid = post.post.cid

    const authorHandle = post.post.author.handle
    const authorDisplayName = post.post.author.displayName || undefined
    const authorAvatar = post.post.author.avatar || undefined

    const hashtags =
      record.facets
        ?.flatMap(f => f.features || [])
        .filter(f => f.$type === 'app.bsky.richtext.facet#tag')
        .map(f => (f as any).tag)
        .filter(Boolean) || []

    const replyParentUri =
      record.reply?.parent?.uri ? record.reply.parent.uri : null

    const quoteUri =
      record.embed &&
      record.embed.$type === 'app.bsky.embed.record#view' &&
      (record.embed as any).record?.uri
        ? (record.embed as any).record.uri
        : null

    const visibility: AtprotoPostRecord['visibility'] = 'public'

    return {
      uri,
      cid,
      text,
      createdAt,
      authorHandle,
      authorDisplayName,
      authorAvatar,
      visibility,
      hashtags,
      replyParentUri,
      quoteUri,
      poll: null,
    }
  }

  async getTimeline(
    opts: AtprotoTimelineOptions = {}
  ): Promise<AtprotoPostRecord[]> {
    const res = await this.agent.app.bsky.feed.getTimeline({
      limit: opts.limit ?? 20,
      cursor: opts.cursor,
    } as AppBskyFeedGetTimeline.QueryParams)

    const feed = res.data.feed || []
    const records: AtprotoPostRecord[] = []

    for (const item of feed) {
      const normalized = this.normalizeFeedPost(item)
      if (!normalized) continue

      if (opts.hashtag) {
        const tag = opts.hashtag.toLowerCase()
        const hasTag =
          normalized.hashtags?.some(h => h.toLowerCase() === tag) ?? false
        if (!hasTag) continue
      }

      records.push(normalized)
    }

    return records
  }

  async getUserFeed(
    opts: AtprotoUserFeedOptions
  ): Promise<AtprotoPostRecord[]> {
    const res = await this.agent.app.bsky.feed.getAuthorFeed({
      actor: opts.handle,
      limit: opts.limit ?? 20,
      cursor: opts.cursor,
    } as AppBskyFeedGetAuthorFeed.QueryParams)

    const feed = res.data.feed || []
    const records: AtprotoPostRecord[] = []

    for (const item of feed) {
      const normalized = this.normalizeFeedPost(item)
      if (normalized) records.push(normalized)
    }

    return records
  }

  async getProfile(handle: string) {
    const res = await this.agent.app.bsky.actor.getProfile({
      actor: handle,
    } as AppBskyActorGetProfile.QueryParams)

    return res.data
  }

  async createPost(
    opts: AtprotoCreatePostOptions
  ): Promise<AtprotoPostRecord> {
    const facets: AppBskyFeedPost.Record['facets'] = []

    if (opts.hashtags && opts.hashtags.length) {
      const text = opts.text
      const features: AppBskyRichtextFacet.Main['features'] = []

      for (const tag of opts.hashtags) {
        const hash = `#${tag}`
        const index = text.indexOf(hash)
        if (index === -1) continue

        features.push({
          $type: 'app.bsky.richtext.facet#tag',
          tag,
        } as any)
      }

      if (features.length) {
        facets.push({
          index: {
            byteStart: 0,
            byteEnd: new TextEncoder().encode(text).length,
          },
          features,
        })
      }
    }

    const record: AppBskyFeedPost.Record = {
      $type: 'app.bsky.feed.post',
      text: opts.text,
      createdAt: new Date().toISOString(),
      facets: facets.length ? facets : undefined,
      reply: opts.replyParentUri
        ? {
            parent: { uri: opts.replyParentUri, cid: '' },
            root: { uri: opts.replyParentUri, cid: '' },
          }
        : undefined,
      embed: opts.quoteUri
        ? {
            $type: 'app.bsky.embed.record',
            record: {
              uri: opts.quoteUri,
              cid: '',
            },
          }
        : undefined,
    }

    const res = await this.agent.post(record)

    const uri = res.uri
    const cid = res.cid

    return {
      uri,
      cid,
      text: record.text,
      createdAt: record.createdAt,
      authorHandle: this.agent.session?.handle || '',
      authorDisplayName: undefined,
      authorAvatar: undefined,
      visibility: opts.visibility,
      hashtags: opts.hashtags,
      replyParentUri: opts.replyParentUri || null,
      quoteUri: opts.quoteUri || null,
      poll: opts.poll || null,
    }
  }
}

export function useAtprotoClient() {
  const globalClient = (globalThis as any).__atprotoClient as AtprotoClient | undefined
  if (globalClient) return globalClient

  throw new Error('ATProto client not initialized')
}

export interface AtprotoGatewayClientOptions {
  baseUrl?: string
  token?: string
}

export interface AtprotoGatewayClient {
  getProfile(handle: string): Promise<{
    did: string
    handle: string
    displayName?: string
    avatar?: string
  }>
  getAuthorFeed(handle: string, limit?: number): Promise<{
    feed: Array<{
      post: {
        uri: string
        record?: {
          text?: string
          createdAt?: string
        }
        author: {
          did: string
          handle: string
          displayName?: string
          avatar?: string
        }
      }
    }>
  }>
  createRecord(repo: string, collection: string, record: any): Promise<unknown>
}

export function createAtprotoGatewayClient(options: AtprotoGatewayClientOptions = {}): AtprotoGatewayClient {
  const { baseUrl, token } = options

  const fetcher = (path: string) => async (params: Record<string, any> = {}) => {
    const url = new URL(path, baseUrl || '/')
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value))
    })

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    })

    return response.json()
  }

  return {
    async getProfile(handle: string) {
      const data = await fetcher(`/xrpc/app.bsky.actor.getProfile`)({ actor: handle })
      return data
    },

    async getAuthorFeed(handle: string, limit?: number) {
      const data = await fetcher(`/xrpc/app.bsky.feed.getAuthorFeed`)({
        actor: handle,
        limit,
      })
      return data
    },

    async createRecord(repo: string, collection: string, record: any) {
      const url = new URL('/xrpc/com.atproto.repo.createRecord', baseUrl || '/')

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo,
          collection,
          record,
        }),
      })

      return response.json()
    },
  }
}
