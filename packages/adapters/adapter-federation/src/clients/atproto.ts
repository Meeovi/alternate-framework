// packages/adapters/adapter-federation/src/clients/atproto.ts
//
// Complete wrapper around the `@atproto/api` npm module (the official
// AT Protocol / Bluesky TypeScript SDK). `AtprotoClient` is the single
// entry point layers/social, layers/search, and layers/auth build on —
// session management, profile, timeline/feeds, posts, engagement (like/
// repost), the social graph (follow/mute/block/lists), notifications,
// search, and media upload all live here so no other layer ever needs to
// import `@atproto/api` directly or hand-build XRPC calls.
//
// Defaults to this deployment's self-hosted PDS (`sky.meeovicms.com`) but
// every method works against any AT Protocol PDS/AppView — pass a
// different `serviceUrl` to talk to `https://bsky.social` or another
// instance entirely.
import {
  AtpAgent,
  RichText,
  type AtpAgentLoginOpts,
  type AtpPersistSessionHandler,
  type AtpSessionData,
  type AtpSessionEvent,
  type AppBskyFeedDefs,
  type AppBskyFeedPost,
  type AppBskyActorDefs,
  type AppBskyActorProfile,
  type AppBskyNotificationListNotifications,
  type AppBskyEmbedImages,
  type AppBskyEmbedExternal,
  type AppBskyEmbedRecord,
  type BlobRef,
  type ComAtprotoRepoStrongRef,
  type ComAtprotoServerDescribeServer,
} from '@atproto/api'

/** This deployment's self-hosted PDS — see the .env.example in this
 *  package and layers/search/layers/auth for how each layer overrides it. */
export const DEFAULT_ATPROTO_SERVICE = 'https://sky.meeovicms.com'

export function getAtprotoServiceUrl(): string {
  return process.env.ATPROTO_SERVICE || process.env.NUXT_ATPROTO_SERVICE || DEFAULT_ATPROTO_SERVICE
}

// ---------------------------------------------------------------------
// Normalized shapes — every method below returns these rather than raw
// lexicon records, so callers (layers/social's composables, the search
// provider, the auth login endpoint) never depend on @atproto/api's own
// response envelopes.
// ---------------------------------------------------------------------

export type AtprotoVisibility = 'public' | 'followers' | 'lists' | 'private'

export interface AtprotoPostRecord {
  uri: string
  cid: string
  text: string
  createdAt: string
  authorDid: string
  authorHandle: string
  authorDisplayName?: string
  authorAvatar?: string
  visibility: AtprotoVisibility
  hashtags?: string[]
  replyParentUri?: string | null
  replyRootUri?: string | null
  quoteUri?: string | null
  images?: Array<{ thumb: string, fullsize: string, alt: string }>
  externalEmbed?: { uri: string, title?: string, description?: string, thumb?: string } | null
  likeCount?: number
  repostCount?: number
  replyCount?: number
  quoteCount?: number
  /** Populated only when this post is the viewer's own — the record's own
   *  like/repost URIs, needed to unlike/unrepost. */
  viewer?: { likeUri?: string, repostUri?: string }
  poll?: {
    options: string[]
    expiresAt: string
    multiple?: boolean
    hideTotals?: boolean
  } | null
}

export interface AtprotoActorRecord {
  did: string
  handle: string
  displayName?: string
  description?: string
  avatar?: string
  banner?: string
  followersCount?: number
  followsCount?: number
  postsCount?: number
  /** Present only when the current session's viewer relationship to this
   *  actor was resolved (profile/search responses, not author-feed items). */
  viewer?: { following?: string | null, followedBy?: string | null, muted?: boolean, blocking?: string | null }
}

export interface AtprotoListRecord {
  uri: string
  cid: string
  name: string
  purpose: string
  description?: string
  avatar?: string
}

export interface AtprotoTrendingTopic {
  topic: string
  displayName?: string
  description?: string
  link: string
}

export interface AtprotoNotification {
  uri: string
  cid: string
  reason: string
  reasonSubject?: string
  isRead: boolean
  indexedAt: string
  author: AtprotoActorRecord
  record: unknown
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

export interface AtprotoSearchPostsOptions {
  query: string
  limit?: number
  cursor?: string
  author?: string
  since?: string
  until?: string
  sort?: 'top' | 'latest'
}

export interface AtprotoSearchActorsOptions {
  query: string
  limit?: number
  cursor?: string
}

export interface AtprotoCreatePostOptions {
  text: string
  visibility?: AtprotoVisibility
  langs?: string[]
  replyParentUri?: string | null
  replyParentCid?: string | null
  replyRootUri?: string | null
  replyRootCid?: string | null
  quoteUri?: string | null
  quoteCid?: string | null
  /** Already-uploaded image blobs (see `uploadImage`), max 4 per post —
   *  the same limit app.bsky.embed.images enforces. */
  images?: Array<{ blob: BlobRef, alt: string, aspectRatio?: { width: number, height: number } }>
  externalEmbed?: { uri: string, title: string, description: string, thumb?: BlobRef }
  createdAt?: string
}

export interface AtprotoClientOptions {
  /** Defaults to DEFAULT_ATPROTO_SERVICE (this deployment's hosted PDS). */
  serviceUrl?: string
  identifier?: string
  password?: string
  /** Resume a previously-persisted session instead of logging in with
   *  identifier/password. */
  session?: AtpSessionData
  /** Called whenever the underlying AtpAgent's session changes (login,
   *  refresh, expiry) — wire this to persist the session server-side if a
   *  caller wants resumable sessions across requests. */
  onSessionChange?: (event: AtpSessionEvent, session: AtpSessionData | undefined) => void
}

export class AtprotoClient {
  readonly agent: AtpAgent

  constructor(options: AtprotoClientOptions = {}) {
    const persistSession: AtpPersistSessionHandler | undefined = options.onSessionChange
      ? (event, session) => options.onSessionChange!(event, session)
      : undefined

    this.agent = new AtpAgent({
      service: options.serviceUrl || getAtprotoServiceUrl(),
      persistSession,
    })
  }

  /** Convenience factory: builds a client and either resumes a persisted
   *  session or logs in with identifier/password (an app password, or a
   *  full password for a self-hosted PDS where app passwords aren't
   *  enforced), whichever is supplied. */
  static async create(options: AtprotoClientOptions): Promise<AtprotoClient> {
    const client = new AtprotoClient(options)
    if (options.session) {
      await client.resumeSession(options.session)
    } else if (options.identifier && options.password) {
      await client.login(options.identifier, options.password)
    }
    return client
  }

  // -- session -----------------------------------------------------------

  async login(identifier: string, password: string, extra?: Partial<AtpAgentLoginOpts>): Promise<AtpSessionData> {
    await this.agent.login({ identifier, password, ...extra })
    if (!this.agent.session) throw new Error('atproto login succeeded but no session was returned')
    return this.agent.session
  }

  /** Creates a brand-new account directly on this client's PDS
   *  (com.atproto.server.createAccount) and hydrates this client's session
   *  with it — the account is immediately logged in, no separate login()
   *  call needed. `handle` must resolve under one of the PDS's
   *  `availableUserDomains` (see describeServer()) unless a custom domain
   *  is already verified. Throws if the handle is taken, too long, or (on
   *  a PDS with `inviteCodeRequired: true`) `inviteCode` is missing/invalid. */
  async createAccount(opts: { handle: string, password: string, email?: string, inviteCode?: string }): Promise<AtpSessionData> {
    await this.agent.createAccount({
      handle: opts.handle,
      password: opts.password,
      email: opts.email,
      inviteCode: opts.inviteCode,
    })
    if (!this.agent.session) throw new Error('atproto createAccount succeeded but no session was returned')
    return this.agent.session
  }

  async resumeSession(session: AtpSessionData): Promise<AtpSessionData> {
    await this.agent.resumeSession(session)
    if (!this.agent.session) throw new Error('atproto resumeSession succeeded but no session was returned')
    return this.agent.session
  }

  async logout(): Promise<void> {
    await this.agent.logout()
  }

  get did(): string | undefined {
    return this.agent.session?.did
  }

  get handle(): string | undefined {
    return this.agent.session?.handle
  }

  get session(): AtpSessionData | undefined {
    return this.agent.session
  }

  get serviceUrl(): string {
    return this.agent.serviceUrl.toString()
  }

  // -- identity ------------------------------------------------------------

  async resolveHandle(handle: string): Promise<{ did: string }> {
    const res = await this.agent.resolveHandle({ handle })
    return res.data
  }

  async describeServer(): Promise<ComAtprotoServerDescribeServer.OutputSchema> {
    const res = await this.agent.com.atproto.server.describeServer()
    return res.data
  }

  // -- profile ---------------------------------------------------------------

  async getProfile(actor: string): Promise<AtprotoActorRecord> {
    const res = await this.agent.getProfile({ actor })
    return this.normalizeActor(res.data)
  }

  async getProfiles(actors: string[]): Promise<AtprotoActorRecord[]> {
    const res = await this.agent.getProfiles({ actors })
    return res.data.profiles.map((p) => this.normalizeActor(p))
  }

  async updateProfile(update: { displayName?: string, description?: string, avatar?: BlobRef, banner?: BlobRef }): Promise<void> {
    await this.agent.upsertProfile((existing: AppBskyActorProfile.Record | undefined) => ({
      ...existing,
      ...(update.displayName !== undefined ? { displayName: update.displayName } : {}),
      ...(update.description !== undefined ? { description: update.description } : {}),
      ...(update.avatar !== undefined ? { avatar: update.avatar } : {}),
      ...(update.banner !== undefined ? { banner: update.banner } : {}),
    }))
  }

  // -- feeds / timeline --------------------------------------------------------

  async getTimeline(opts: AtprotoTimelineOptions = {}): Promise<{ posts: AtprotoPostRecord[], cursor?: string }> {
    const res = await this.agent.getTimeline({ limit: opts.limit ?? 20, cursor: opts.cursor })
    return this.normalizeFeed(res.data.feed, res.data.cursor, opts.hashtag)
  }

  async getAuthorFeed(opts: AtprotoUserFeedOptions): Promise<{ posts: AtprotoPostRecord[], cursor?: string }> {
    const res = await this.agent.getAuthorFeed({ actor: opts.handle, limit: opts.limit ?? 20, cursor: opts.cursor })
    return this.normalizeFeed(res.data.feed, res.data.cursor)
  }

  async getActorLikes(actor: string, opts: { limit?: number, cursor?: string } = {}): Promise<{ posts: AtprotoPostRecord[], cursor?: string }> {
    const res = await this.agent.getActorLikes({ actor, limit: opts.limit ?? 20, cursor: opts.cursor })
    return this.normalizeFeed(res.data.feed, res.data.cursor)
  }

  /** A custom feed generator (`at://did/app.bsky.feed.generator/rkey`), e.g.
   *  "What's Hot" or any third-party algorithmic feed. */
  async getFeed(feedUri: string, opts: { limit?: number, cursor?: string } = {}): Promise<{ posts: AtprotoPostRecord[], cursor?: string }> {
    const res = await this.agent.app.bsky.feed.getFeed({ feed: feedUri, limit: opts.limit ?? 20, cursor: opts.cursor })
    return this.normalizeFeed(res.data.feed, res.data.cursor)
  }

  async getPostThread(uri: string, opts: { depth?: number, parentHeight?: number } = {}) {
    const res = await this.agent.getPostThread({ uri, depth: opts.depth, parentHeight: opts.parentHeight })
    return res.data.thread
  }

  async getPost(uri: string): Promise<AtprotoPostRecord | null> {
    const res = await this.agent.getPosts({ uris: [uri] })
    const post = res.data.posts[0]
    return post ? this.normalizePostView(post) : null
  }

  async getPosts(uris: string[]): Promise<AtprotoPostRecord[]> {
    if (!uris.length) return []
    const res = await this.agent.getPosts({ uris })
    return res.data.posts.map((post) => this.normalizePostView(post))
  }

  // -- posting -----------------------------------------------------------------

  /** Uploads an image and returns a blob ref usable in `createPost`'s
   *  `images` option. Accepts anything `fetch`'s Blob-compatible body
   *  accepts on Node (Uint8Array/Buffer) or in the browser (Blob/File). */
  async uploadImage(data: Uint8Array | Blob, mimeType = 'image/jpeg'): Promise<BlobRef> {
    const res = await this.agent.uploadBlob(data, { encoding: mimeType })
    return res.data.blob
  }

  async createPost(opts: AtprotoCreatePostOptions): Promise<AtprotoPostRecord> {
    // RichText.detectFacetsWithoutResolution finds hashtags/links by regex
    // without a network round trip; detectFacets (which needs an agent)
    // additionally resolves @mentions to DIDs. Mentions are rare enough in
    // this app's compose flow that the extra resolution round trip isn't
    // worth doing unconditionally, but hashtags/links always get facets.
    const rt = new RichText({ text: opts.text })
    await rt.detectFacets(this.agent)

    let embed: AppBskyFeedPost.Record['embed']
    if (opts.images?.length) {
      embed = {
        $type: 'app.bsky.embed.images',
        images: opts.images.slice(0, 4).map((img): AppBskyEmbedImages.Image => ({
          image: img.blob,
          alt: img.alt,
          aspectRatio: img.aspectRatio,
        })),
      }
    } else if (opts.quoteUri) {
      embed = {
        $type: 'app.bsky.embed.record',
        record: await this.resolveStrongRef(opts.quoteUri, opts.quoteCid),
      } satisfies AppBskyEmbedRecord.Main
    } else if (opts.externalEmbed) {
      embed = {
        $type: 'app.bsky.embed.external',
        external: {
          uri: opts.externalEmbed.uri,
          title: opts.externalEmbed.title,
          description: opts.externalEmbed.description,
          thumb: opts.externalEmbed.thumb,
        },
      } satisfies AppBskyEmbedExternal.Main
    }

    // Both cids are optional on the caller's side — a caller that already
    // holds the post it's replying to/quoting (e.g. from a prior
    // getPost/getTimeline call) can pass them straight through with no
    // extra round trip; resolveStrongRef looks the cid up via getPost
    // otherwise. Root defaults to the parent itself (correct for replying
    // to a top-level post); pass replyRootUri explicitly for a deeper
    // thread reply.
    let reply: AppBskyFeedPost.Record['reply']
    if (opts.replyParentUri) {
      const parent = await this.resolveStrongRef(opts.replyParentUri, opts.replyParentCid)
      const root = opts.replyRootUri ? await this.resolveStrongRef(opts.replyRootUri, opts.replyRootCid) : parent
      reply = { parent, root }
    }

    const record: Partial<AppBskyFeedPost.Record> & Omit<AppBskyFeedPost.Record, 'createdAt'> = {
      $type: 'app.bsky.feed.post',
      text: rt.text,
      facets: rt.facets,
      langs: opts.langs,
      reply,
      embed,
      createdAt: opts.createdAt || new Date().toISOString(),
    }

    const res = await this.agent.post(record)
    const hashtags = rt.facets
      ?.flatMap((f) => f.features)
      .filter((f: any) => f.$type === 'app.bsky.richtext.facet#tag')
      .map((f: any) => f.tag as string)

    return {
      uri: res.uri,
      cid: res.cid,
      text: rt.text,
      createdAt: record.createdAt!,
      authorDid: this.agent.session?.did || '',
      authorHandle: this.agent.session?.handle || '',
      visibility: opts.visibility || 'public',
      hashtags,
      replyParentUri: opts.replyParentUri || null,
      replyRootUri: opts.replyRootUri || null,
      quoteUri: opts.quoteUri || null,
      poll: null,
    }
  }

  async deletePost(uri: string): Promise<void> {
    await this.agent.deletePost(uri)
  }

  // -- engagement --------------------------------------------------------------

  async like(uri: string, cid: string): Promise<{ likeUri: string }> {
    const res = await this.agent.like(uri, cid)
    return { likeUri: res.uri }
  }

  async unlike(likeUri: string): Promise<void> {
    await this.agent.deleteLike(likeUri)
  }

  async repost(uri: string, cid: string): Promise<{ repostUri: string }> {
    const res = await this.agent.repost(uri, cid)
    return { repostUri: res.uri }
  }

  async unrepost(repostUri: string): Promise<void> {
    await this.agent.deleteRepost(repostUri)
  }

  async getLikes(uri: string, opts: { limit?: number, cursor?: string } = {}): Promise<{ actors: AtprotoActorRecord[], cursor?: string }> {
    const res = await this.agent.getLikes({ uri, limit: opts.limit, cursor: opts.cursor })
    return { actors: res.data.likes.map((l) => this.normalizeActor(l.actor)), cursor: res.data.cursor }
  }

  async getRepostedBy(uri: string, opts: { limit?: number, cursor?: string } = {}): Promise<{ actors: AtprotoActorRecord[], cursor?: string }> {
    const res = await this.agent.getRepostedBy({ uri, limit: opts.limit, cursor: opts.cursor })
    return { actors: res.data.repostedBy.map((a) => this.normalizeActor(a)), cursor: res.data.cursor }
  }

  // -- social graph ------------------------------------------------------------

  async follow(subjectDid: string): Promise<{ followUri: string }> {
    const res = await this.agent.follow(subjectDid)
    return { followUri: res.uri }
  }

  async unfollow(followUri: string): Promise<void> {
    await this.agent.deleteFollow(followUri)
  }

  async getFollowers(actor: string, opts: { limit?: number, cursor?: string } = {}): Promise<{ actors: AtprotoActorRecord[], cursor?: string }> {
    const res = await this.agent.getFollowers({ actor, limit: opts.limit ?? 50, cursor: opts.cursor })
    return { actors: res.data.followers.map((a) => this.normalizeActor(a)), cursor: res.data.cursor }
  }

  async getFollows(actor: string, opts: { limit?: number, cursor?: string } = {}): Promise<{ actors: AtprotoActorRecord[], cursor?: string }> {
    const res = await this.agent.getFollows({ actor, limit: opts.limit ?? 50, cursor: opts.cursor })
    return { actors: res.data.follows.map((a) => this.normalizeActor(a)), cursor: res.data.cursor }
  }

  async muteActor(actor: string): Promise<void> {
    await this.agent.mute(actor)
  }

  async unmuteActor(actor: string): Promise<void> {
    await this.agent.unmute(actor)
  }

  /** app.bsky.graph.block has no AtpAgent convenience method — it's a
   *  plain record write against the viewer's own repo. */
  async blockActor(subjectDid: string): Promise<{ blockUri: string }> {
    const res = await this.agent.app.bsky.graph.block.create(
      { repo: this.assertDid() },
      { subject: subjectDid, createdAt: new Date().toISOString() },
    )
    return { blockUri: res.uri }
  }

  async unblockActor(blockUri: string): Promise<void> {
    const { rkey } = parseAtUri(blockUri)
    await this.agent.app.bsky.graph.block.delete({ repo: this.assertDid(), rkey })
  }

  async getLists(actor: string, opts: { limit?: number, cursor?: string } = {}): Promise<{ lists: AtprotoListRecord[], cursor?: string }> {
    const res = await this.agent.app.bsky.graph.getLists({ actor, limit: opts.limit, cursor: opts.cursor })
    return {
      lists: res.data.lists.map((l): AtprotoListRecord => ({
        uri: l.uri,
        cid: l.cid,
        name: l.name,
        purpose: l.purpose,
        description: l.description,
        avatar: l.avatar,
      })),
      cursor: res.data.cursor,
    }
  }

  async createList(opts: { name: string, purpose: 'app.bsky.graph.defs#curatelist' | 'app.bsky.graph.defs#modlist', description?: string }): Promise<{ listUri: string }> {
    const res = await this.agent.app.bsky.graph.list.create(
      { repo: this.assertDid() },
      { name: opts.name, purpose: opts.purpose, description: opts.description, createdAt: new Date().toISOString() },
    )
    return { listUri: res.uri }
  }

  // -- notifications -------------------------------------------------------------

  async listNotifications(opts: { limit?: number, cursor?: string } = {}): Promise<{ notifications: AtprotoNotification[], cursor?: string }> {
    const res = await this.agent.listNotifications({ limit: opts.limit ?? 30, cursor: opts.cursor })
    return {
      notifications: res.data.notifications.map((n: AppBskyNotificationListNotifications.Notification): AtprotoNotification => ({
        uri: n.uri,
        cid: n.cid,
        reason: n.reason,
        reasonSubject: n.reasonSubject,
        isRead: n.isRead,
        indexedAt: n.indexedAt,
        author: this.normalizeActor(n.author),
        record: n.record,
      })),
      cursor: res.data.cursor,
    }
  }

  async getUnreadNotificationCount(): Promise<number> {
    const res = await this.agent.countUnreadNotifications()
    return res.data.count
  }

  async updateNotificationsSeen(seenAt: string = new Date().toISOString()): Promise<void> {
    await this.agent.updateSeenNotifications(seenAt)
  }

  // -- search — powers layers/search's federated atproto provider -----------------

  async searchPosts(opts: AtprotoSearchPostsOptions): Promise<{ posts: AtprotoPostRecord[], cursor?: string }> {
    const res = await this.agent.app.bsky.feed.searchPosts({
      q: opts.query,
      limit: opts.limit ?? 25,
      cursor: opts.cursor,
      author: opts.author,
      since: opts.since,
      until: opts.until,
      sort: opts.sort,
    })
    return {
      posts: res.data.posts.map((post) => this.normalizePostView(post)),
      cursor: res.data.cursor,
    }
  }

  async searchActors(opts: AtprotoSearchActorsOptions): Promise<{ actors: AtprotoActorRecord[], cursor?: string }> {
    const res = await this.agent.searchActors({ q: opts.query, limit: opts.limit ?? 25, cursor: opts.cursor })
    return { actors: res.data.actors.map((a) => this.normalizeActor(a)), cursor: res.data.cursor }
  }

  async searchActorsTypeahead(query: string, limit = 8): Promise<AtprotoActorRecord[]> {
    const res = await this.agent.searchActorsTypeahead({ q: query, limit })
    return res.data.actors.map((a) => this.normalizeActor(a))
  }

  /** Algorithmic "accounts you might like" — app.bsky.actor.getSuggestions.
   *  Personalized when called with an authenticated session, a generic
   *  popular-accounts list otherwise (used by layers/social's "members"
   *  page to surface atproto accounts alongside local members). */
  async getSuggestedActors(opts: { limit?: number, cursor?: string } = {}): Promise<{ actors: AtprotoActorRecord[], cursor?: string }> {
    const res = await this.agent.getSuggestions({ limit: opts.limit ?? 25, cursor: opts.cursor })
    return { actors: res.data.actors.map((a) => this.normalizeActor(a)), cursor: res.data.cursor }
  }

  /** app.bsky.unspecced.getTrendingTopics — the closest atproto equivalent
   *  to a site-wide "hashtags" listing (atproto has no endpoint to list
   *  all hashtags in use; this is the network's own trending-topics
   *  surface). `unspecced` = not yet a stable, versioned lexicon —
   *  confirmed present in the installed @atproto/api, but treat this as
   *  more likely to change/disappear across SDK upgrades than the rest of
   *  this wrapper. */
  async getTrendingTopics(opts: { limit?: number } = {}): Promise<{ topics: AtprotoTrendingTopic[], suggested: AtprotoTrendingTopic[] }> {
    const res = await this.agent.app.bsky.unspecced.getTrendingTopics({ limit: opts.limit ?? 25 })
    const map = (t: { topic: string, displayName?: string, description?: string, link: string }): AtprotoTrendingTopic => ({
      topic: t.topic,
      displayName: t.displayName,
      description: t.description,
      link: t.link,
    })
    return { topics: res.data.topics.map(map), suggested: res.data.suggested.map(map) }
  }

  // -- normalization -------------------------------------------------------------

  private assertDid(): string {
    const did = this.did
    if (!did) throw new Error('AtprotoClient: no active session (this operation requires an authenticated agent)')
    return did
  }

  /** Resolves a bare at:// URI to a full {uri, cid} strong ref, reusing a
   *  caller-supplied cid when given instead of looking it up. */
  private async resolveStrongRef(uri: string, cid?: string | null): Promise<ComAtprotoRepoStrongRef.Main> {
    if (cid) return { uri, cid }
    const post = await this.getPost(uri)
    if (!post) throw new Error(`AtprotoClient: post not found, cannot resolve strong ref: ${uri}`)
    return { uri, cid: post.cid }
  }

  private normalizeFeed(feed: AppBskyFeedDefs.FeedViewPost[], cursor: string | undefined, hashtag?: string): { posts: AtprotoPostRecord[], cursor?: string } {
    const posts: AtprotoPostRecord[] = []
    for (const item of feed) {
      const normalized = this.normalizePostView(item.post, item.reply)
      if (!normalized) continue
      if (hashtag) {
        const tag = hashtag.toLowerCase()
        if (!normalized.hashtags?.some((h) => h.toLowerCase() === tag)) continue
      }
      posts.push(normalized)
    }
    return { posts, cursor }
  }

  private normalizePostView(post: AppBskyFeedDefs.PostView, reply?: AppBskyFeedDefs.ReplyRef): AtprotoPostRecord {
    const record = post.record as AppBskyFeedPost.Record

    const hashtags = record.facets
      ?.flatMap((f) => f.features)
      .filter((f: any) => f.$type === 'app.bsky.richtext.facet#tag')
      .map((f: any) => f.tag as string)

    const replyParentUri = reply?.parent && 'uri' in reply.parent ? (reply.parent as any).uri : record.reply?.parent?.uri || null
    const replyRootUri = reply?.root && 'uri' in reply.root ? (reply.root as any).uri : record.reply?.root?.uri || null

    let images: AtprotoPostRecord['images']
    let externalEmbed: AtprotoPostRecord['externalEmbed'] = null
    let quoteUri: string | null = null

    const embed = post.embed as any
    if (embed?.$type === 'app.bsky.embed.images#view') {
      images = embed.images.map((img: any) => ({ thumb: img.thumb, fullsize: img.fullsize, alt: img.alt }))
    } else if (embed?.$type === 'app.bsky.embed.external#view') {
      externalEmbed = {
        uri: embed.external.uri,
        title: embed.external.title,
        description: embed.external.description,
        thumb: embed.external.thumb,
      }
    } else if (embed?.$type === 'app.bsky.embed.record#view' && embed.record?.uri) {
      quoteUri = embed.record.uri
    } else if (embed?.$type === 'app.bsky.embed.recordWithMedia#view') {
      if (embed.record?.record?.uri) quoteUri = embed.record.record.uri
      if (embed.media?.$type === 'app.bsky.embed.images#view') {
        images = embed.media.images.map((img: any) => ({ thumb: img.thumb, fullsize: img.fullsize, alt: img.alt }))
      }
    }

    return {
      uri: post.uri,
      cid: post.cid,
      text: typeof record.text === 'string' ? record.text : '',
      createdAt: record.createdAt || post.indexedAt,
      authorDid: post.author.did,
      authorHandle: post.author.handle,
      authorDisplayName: post.author.displayName,
      authorAvatar: post.author.avatar,
      visibility: 'public',
      hashtags,
      replyParentUri,
      replyRootUri,
      quoteUri,
      images,
      externalEmbed,
      likeCount: post.likeCount,
      repostCount: post.repostCount,
      replyCount: post.replyCount,
      quoteCount: post.quoteCount,
      viewer: post.viewer ? { likeUri: post.viewer.like, repostUri: post.viewer.repost } : undefined,
      poll: null,
    }
  }

  private normalizeActor(actor: AppBskyActorDefs.ProfileViewDetailed | AppBskyActorDefs.ProfileView | AppBskyActorDefs.ProfileViewBasic): AtprotoActorRecord {
    const detailed = actor as AppBskyActorDefs.ProfileViewDetailed
    return {
      did: actor.did,
      handle: actor.handle,
      displayName: actor.displayName,
      description: detailed.description,
      avatar: actor.avatar,
      banner: detailed.banner,
      followersCount: detailed.followersCount,
      followsCount: detailed.followsCount,
      postsCount: detailed.postsCount,
      viewer: actor.viewer
        ? { following: actor.viewer.following, followedBy: actor.viewer.followedBy, muted: actor.viewer.muted, blocking: actor.viewer.blocking }
        : undefined,
    }
  }
}

function parseAtUri(uri: string): { did: string, collection: string, rkey: string } {
  const match = /^at:\/\/([^/]+)\/([^/]+)\/([^/]+)$/.exec(uri)
  if (!match) throw new Error(`Invalid at:// URI: ${uri}`)
  return { did: match[1]!, collection: match[2]!, rkey: match[3]! }
}

// ---------------------------------------------------------------------
// Server-side singleton accessor. `runtime/server/atproto.ts` (a Nitro
// plugin registered by this package's Nuxt module, see src/module.ts)
// logs a service-level AtprotoClient in against the configured PDS and
// stores it here — this mirrors the existing (equally global)
// `globalThis.__mastoClient` convention used elsewhere in this
// repo/layers/social for the Mastodon client.
// ---------------------------------------------------------------------

export function setAtprotoClient(client: AtprotoClient): void {
  ;(globalThis as any).__atprotoClient = client
}

export function useAtprotoClient(): AtprotoClient {
  const globalClient = (globalThis as any).__atprotoClient as AtprotoClient | undefined
  if (globalClient) return globalClient

  throw new Error('ATProto client not initialized — register @mframework/adapter-federation/nuxt as a Nuxt module so its server plugin can bootstrap globalThis.__atprotoClient (requires ATPROTO_IDENTIFIER/ATPROTO_APP_PASSWORD or a per-request session).')
}

// ---------------------------------------------------------------------
// Unauthenticated, read-only gateway client — thin fetch wrapper for
// public XRPC reads (profile/author-feed) and record creation via a
// caller-supplied bearer token. Kept separate from AtprotoClient: this is
// meant for call sites (e.g. a browser-exposed proxy) that only ever have
// a base URL + optional token, never a full login flow.
// ---------------------------------------------------------------------

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
  const baseUrl = options.baseUrl || getAtprotoServiceUrl()
  const { token } = options

  const fetcher = (path: string) => async (params: Record<string, any> = {}) => {
    const url = new URL(path, baseUrl)
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
      const url = new URL('/xrpc/com.atproto.repo.createRecord', baseUrl)

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
