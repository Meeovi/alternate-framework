import { describe, expect, it } from 'vitest'
import type { mastodon } from '../runtime/client'
import {
  createActivitypubNetwork,
  htmlToText,
  queryToHashtag,
  toFederatedActor,
  toFederatedPost,
} from '../runtime/network'
import { normalizeActivityStreamsActor, normalizeActivityStreamsPost, toOrderedItems } from '../runtime/protocol/activitystreams'
import { resolveWebfinger } from '../runtime/protocol/webfinger'

// Live, read-only checks against a real Mastodon server. Set
// FEDERATION_LIVE=0 to skip them offline.
const LIVE = process.env.FEDERATION_LIVE !== '0'
const SERVER = process.env.ACTIVITYPUB_TEST_SERVER || 'https://mastodon.social'

const account = (over: Partial<mastodon.v1.Account> = {}) => ({
  id: '13179',
  acct: 'Mastodon',
  username: 'Mastodon',
  displayName: 'Mastodon',
  avatar: 'https://files.test/a.png',
  note: '<p>Free, open-source <a href="#">decentralized</a> social media &amp; more</p>',
  url: 'https://mastodon.social/@Mastodon',
  followersCount: 10,
  followingCount: 2,
  statusesCount: 30,
  ...over,
}) as unknown as mastodon.v1.Account

const status = (over: Partial<mastodon.v1.Status> = {}) => ({
  id: '1',
  uri: 'https://mastodon.social/users/Mastodon/statuses/1',
  url: 'https://mastodon.social/@Mastodon/1',
  content: '<p>Hello <a href="https://mastodon.social/tags/fediverse">#<span>fediverse</span></a><br>line two</p>',
  createdAt: '2026-10-12T10:00:00.000Z',
  account: account(),
  mediaAttachments: [{ id: 'm', type: 'gifv', url: 'https://files.test/v.mp4', previewUrl: 'https://files.test/v.png', description: 'clip' }],
  tags: [{ name: 'fediverse', url: '' }],
  repliesCount: 1,
  reblogsCount: 2,
  favouritesCount: 3,
  reblog: null,
  ...over,
}) as unknown as mastodon.v1.Status

describe('activitypub mapping', () => {
  it('turns Mastodon HTML into text', () => {
    expect(htmlToText('<p>a &amp; b</p><p>c<br/>d &#39;e&#x27;</p>')).toBe("a & b\n\nc\nd 'e'")
    expect(htmlToText(null)).toBe('')
  })

  it('picks the first word of a query as the hashtag', () => {
    expect(queryToHashtag('#Fediverse news')).toBe('Fediverse')
    expect(queryToHashtag('  café au lait')).toBe('café')
    expect(queryToHashtag('!!!')).toBe('')
  })

  it('maps accounts, adding the domain to local handles', () => {
    const a = toFederatedActor(account(), 'mastodon.social')
    expect(a).toMatchObject({ id: '13179', network: 'activitypub', handle: 'Mastodon@mastodon.social', followers: 10, posts: 30 })
    expect(a.bio).toBe('Free, open-source decentralized social media & more')
    expect(toFederatedActor(account({ acct: 'bob@other.example' }), 'mastodon.social').handle).toBe('bob@other.example')
  })

  it('maps statuses, media and counts, and unwraps boosts', () => {
    const p = toFederatedPost(status(), 'mastodon.social')
    expect(p).toMatchObject({ id: '1', network: 'activitypub', url: 'https://mastodon.social/@Mastodon/1', replies: 1, reposts: 2, likes: 3 })
    expect(p.text).toBe('Hello #fediverse\nline two')
    expect(p.media).toEqual([{ url: 'https://files.test/v.mp4', preview: 'https://files.test/v.png', alt: 'clip', type: 'video' }])
    expect(p.hashtags).toEqual(['fediverse'])

    const boost = toFederatedPost(status({ id: '2', reblog: status({ id: '9', account: account({ acct: 'carol@x.test' }) }) }), 'mastodon.social')
    expect(boost.id).toBe('9')
    expect(boost.author.handle).toBe('carol@x.test')
  })

  it('only offers publish with an access token', () => {
    expect(createActivitypubNetwork({ server: SERVER }).publish).toBeUndefined()
    expect(typeof createActivitypubNetwork({ server: SERVER, accessToken: 'x' }).publish).toBe('function')
  })
})

// Moved from adapter-federation (same case).
describe('activitystreams helpers', () => {
  it('normalizes actor and post payloads', () => {
    const actor = normalizeActivityStreamsActor({ id: 'https://example.social/users/alice', preferredUsername: 'alice', name: 'Alice' })
    const post = normalizeActivityStreamsPost({
      object: { id: 'post-1', content: 'hello fediverse', published: '2026-01-01T00:00:00.000Z' },
      actor,
    })
    expect(actor.username).toBe('alice')
    expect(post.id).toBe('post-1')
    expect(post.author.id).toBe('https://example.social/users/alice')
    expect(toOrderedItems({ orderedItems: [1, 2] })).toEqual([1, 2])
  })
})

describe.runIf(LIVE)(`activitypub network (live: ${SERVER})`, { timeout: 30000 }, () => {
  const network = createActivitypubNetwork({ server: SERVER })

  it('reports the instance as connected, read-only', async () => {
    const s = await network.status()
    expect(s).toMatchObject({ configured: true, connected: true, service: SERVER, account: null })
    expect(s.detail).toMatch(/Mastodon/)
  })

  it('looks up a profile and 404s to null', async () => {
    const p = await network.profile!('Mastodon')
    expect(p?.handle).toBe(`Mastodon@${new URL(SERVER).host}`)
    expect(p?.posts).toBeGreaterThan(0)
    expect(await network.profile!('no-such-user-meeovi-test-0000')).toBeNull()
  })

  it("reads an account's posts", async () => {
    const posts = await network.feed!('Mastodon', { limit: 3 })
    expect(posts.length).toBeGreaterThan(0)
    expect(posts.length).toBeLessThanOrEqual(3)
    expect(posts[0]).toMatchObject({ network: 'activitypub' })
    expect(posts[0]!.createdAt).toMatch(/^\d{4}-/)
  })

  it('searches by hashtag without a token', async () => {
    const posts = await network.searchPosts!('#fediverse', { limit: 5 })
    expect(posts.length).toBeGreaterThan(0)
    expect(posts.every((p) => p.hashtags?.some((t) => t.toLowerCase() === 'fediverse'))).toBe(true)
  })

  it('resolves WebFinger', async () => {
    const w = await resolveWebfinger(`Mastodon@${new URL(SERVER).host}`)
    expect(w.subject.toLowerCase()).toBe(`acct:mastodon@${new URL(SERVER).host}`)
  })
})
