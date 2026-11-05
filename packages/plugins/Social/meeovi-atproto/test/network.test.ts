import { afterEach, describe, expect, it } from 'vitest'
import { AtprotoClient, DEFAULT_ATPROTO_SERVICE, setAtprotoClient, type AtprotoActorRecord, type AtprotoPostRecord } from '../runtime/client'
import { createAtprotoNetwork, toFederatedActor, toFederatedPost } from '../runtime/network'

// Live, read-only checks. Set FEDERATION_LIVE=0 to skip them offline.
const LIVE = process.env.FEDERATION_LIVE !== '0'
// Public Bluesky AppView: unauthenticated profile/feed reads.
const PUBLIC_APPVIEW = 'https://public.api.bsky.app'

const actor: AtprotoActorRecord = {
  did: 'did:plc:alice',
  handle: 'alice.test',
  displayName: 'Alice',
  description: 'hi',
  avatar: 'https://cdn.test/a.jpg',
  followersCount: 5,
  followsCount: 6,
  postsCount: 7,
}

const post: AtprotoPostRecord = {
  uri: 'at://did:plc:alice/app.bsky.feed.post/3kabc',
  cid: 'cid1',
  text: 'hello #meeovi',
  createdAt: '2026-10-12T10:00:00.000Z',
  authorDid: 'did:plc:alice',
  authorHandle: 'alice.test',
  authorDisplayName: 'Alice',
  visibility: 'public',
  hashtags: ['meeovi'],
  images: [{ thumb: 'https://cdn.test/t.jpg', fullsize: 'https://cdn.test/f.jpg', alt: 'pic' }],
  likeCount: 3,
  repostCount: 2,
  replyCount: 1,
}

describe('atproto mapping', () => {
  it('maps actors with Bluesky profile links', () => {
    expect(toFederatedActor(actor)).toEqual({
      id: 'did:plc:alice', network: 'atproto', handle: 'alice.test', displayName: 'Alice', avatar: 'https://cdn.test/a.jpg',
      bio: 'hi', url: 'https://bsky.app/profile/alice.test', followers: 5, following: 6, posts: 7,
    })
  })

  it('maps posts, images and counts', () => {
    const p = toFederatedPost(post)
    expect(p).toMatchObject({
      id: post.uri, network: 'atproto', url: 'https://bsky.app/profile/alice.test/post/3kabc',
      text: 'hello #meeovi', likes: 3, reposts: 2, replies: 1, hashtags: ['meeovi'],
    })
    expect(p.author).toMatchObject({ id: 'did:plc:alice', handle: 'alice.test' })
    expect(p.media).toEqual([{ url: 'https://cdn.test/f.jpg', preview: 'https://cdn.test/t.jpg', alt: 'pic', type: 'image' }])
  })
})

describe('atproto network over the service-account client', () => {
  afterEach(() => { delete (globalThis as any).__atprotoClient })

  it('uses the signed-in service account when bootstrap has set one', async () => {
    const calls: string[] = []
    const fake = {
      handle: 'meeovi.sky.meeovicms.com',
      describeServer: async () => { calls.push('describe'); return {} },
      getProfile: async (h: string) => { calls.push(`profile:${h}`); return actor },
      getAuthorFeed: async (o: { handle: string, limit: number }) => { calls.push(`feed:${o.handle}:${o.limit}`); return { posts: [post] } },
      searchPosts: async (o: { query: string, sort: string }) => { calls.push(`search:${o.query}:${o.sort}`); return { posts: [post] } },
    }
    setAtprotoClient(fake as unknown as AtprotoClient)
    const network = createAtprotoNetwork({ service: 'https://pds.test', configured: true })

    expect(await network.status()).toMatchObject({ configured: true, connected: true, service: "https://pds.test", account: "meeovi.sky.meeovicms.com" })
    expect((await network.profile!('alice.test'))?.handle).toBe('alice.test')
    expect((await network.feed!('alice.test', { limit: 4 }))[0]?.id).toBe(post.uri)
    expect((await network.searchPosts!('meeovi'))[0]?.text).toBe('hello #meeovi')
    expect(calls).toEqual(['describe', 'profile:alice.test', 'feed:alice.test:4', 'search:meeovi:latest'])
  })

  it('treats an unknown handle as not found and reports outages in status', async () => {
    setAtprotoClient({
      handle: undefined,
      describeServer: async () => { throw new Error('fetch failed') },
      getProfile: async () => { throw Object.assign(new Error('Profile not found'), { status: 400 }) },
    } as unknown as AtprotoClient)
    const network = createAtprotoNetwork({ service: 'https://pds.test' })
    expect(await network.profile!('nobody.test')).toBeNull()
    expect(await network.status()).toMatchObject({ connected: false, configured: false, detail: 'fetch failed', account: null })
  })

  it('has no publish (per-user posting stays on /api/social/atproto/post)', () => {
    expect(createAtprotoNetwork().publish).toBeUndefined()
  })
})

describe.runIf(LIVE)('atproto network (live)', { timeout: 30000 }, () => {
  it('reads a public list of accounts, with its page here and its source on bsky.app', async () => {
    const network = createAtprotoNetwork({ service: PUBLIC_APPVIEW })
    const uri = 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.graph.list/3lvpca43j5z26' // bsky.app's "Community Showcase"
    const found = await network.list!(uri, { limit: 5 })
    expect(found?.list).toMatchObject({
      id: uri,
      network: 'atproto',
      kind: 'accounts',
      path: `/lists/list/${encodeURIComponent(`atproto:${uri}`)}`,
      url: 'https://bsky.app/profile/did:plc:z72i7hdynmk6r22z27h6tvur/lists/3lvpca43j5z26',
    })
    expect(found!.items.length).toBeGreaterThan(0)
    expect(found!.items[0]).toMatchObject({ kind: 'account', actor: { network: 'atproto' } })
    expect(await network.list!('at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.post/3lvpca43j5z26')).toBeNull()
  })

  it('reads a profile and feed anonymously from the public AppView', async () => {
    const network = createAtprotoNetwork({ service: PUBLIC_APPVIEW })
    const profile = await network.profile!('bsky.app')
    expect(profile).toMatchObject({ network: 'atproto', handle: 'bsky.app' })
    expect(profile!.id).toMatch(/^did:/)
    const posts = await network.feed!('bsky.app', { limit: 3 })
    expect(posts.length).toBeGreaterThan(0)
    // (a repost in the feed is someone else's post)
    expect(posts[0]!.url).toMatch(/^https:\/\/bsky\.app\/profile\/[^/]+\/post\//)
  })

  it("reaches this deployment's PDS", async () => {
    const s = await createAtprotoNetwork({ service: DEFAULT_ATPROTO_SERVICE }).status()
    expect(s).toMatchObject({ connected: true, service: DEFAULT_ATPROTO_SERVICE })
  })
})

describe('atproto network without a service account', () => {
  afterEach(() => { delete (globalThis as any).__atprotoClient })

  it("reports a PDS that requires a session as not connected (503), not an outage", async () => {
    const network = createAtprotoNetwork({ service: 'https://pds.test' })
    const authMissing = Object.assign(new Error('Authentication Required'), { error: 'AuthMissing' })
    // Anonymous client: swap its read methods for ones that fail like the PDS does.
    const anon = AtprotoClient.prototype
    const saved = { getProfile: anon.getProfile, searchPosts: anon.searchPosts }
    anon.getProfile = async () => { throw authMissing }
    anon.searchPosts = async () => { throw authMissing }
    try {
      await expect(network.profile!('alice.test')).rejects.toMatchObject({ statusCode: 503 })
      await expect(network.searchPosts!('x')).rejects.toMatchObject({ statusCode: 503 })
    } finally {
      Object.assign(anon, saved)
    }
  })
})
