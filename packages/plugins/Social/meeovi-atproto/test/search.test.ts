import { afterEach, describe, expect, it, vi } from 'vitest'
import { AtprotoClient, type AtprotoActorRecord, type AtprotoPostRecord } from '../runtime/client'
import { createAtprotoSearchProvider, type AtprotoSearchConfig } from '../runtime/search'

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
}

const actor: AtprotoActorRecord = {
  did: 'did:plc:bob',
  handle: 'bob.test',
  displayName: 'Bob',
  followersCount: 2,
}

const options = { query: 'hello', page: 1, pageSize: 4 }

// Each test gets its own service URL, so the provider's cached client
// (keyed by service + identifier) never leaks between tests.
let n = 0
const config = (overrides: Partial<AtprotoSearchConfig> = {}): AtprotoSearchConfig => ({ enabled: true, service: `https://pds${++n}.test`, ...overrides })

afterEach(() => vi.restoreAllMocks())

describe('atproto search provider', () => {
  it('is enabled only with a service and enabled: true, and tolerates missing config', () => {
    expect(createAtprotoSearchProvider(() => config()).isEnabled()).toBe(true)
    expect(createAtprotoSearchProvider(() => config({ enabled: false })).isEnabled()).toBe(false)
    expect(createAtprotoSearchProvider(() => config({ service: '' })).isEnabled()).toBe(false)
    expect(createAtprotoSearchProvider(() => undefined).isEnabled()).toBe(false)
  })

  it('leaves out adult, taken-down and logged-in-only content', async () => {
    vi.spyOn(AtprotoClient.prototype, 'searchPosts').mockResolvedValue({
      posts: [
        post,
        { ...post, uri: 'at://did:plc:x/app.bsky.feed.post/porn', labels: ['porn'] },
        { ...post, uri: 'at://did:plc:x/app.bsky.feed.post/hidden-author', authorLabels: ['!no-unauthenticated'] },
        { ...post, uri: 'at://did:plc:x/app.bsky.feed.post/bot', authorLabels: ['bot'] },
      ],
    })
    vi.spyOn(AtprotoClient.prototype, 'searchActors').mockResolvedValue({
      actors: [actor, { ...actor, did: 'did:plc:nsfw', labels: ['sexual'] }],
    })

    const result = await createAtprotoSearchProvider(() => config()).search(options)

    expect(result.items.map((hit) => hit.id)).toEqual([
      post.uri,
      'at://did:plc:x/app.bsky.feed.post/bot',
      actor.did,
    ])
  })

  it('answers an empty query with an empty page, without calling the PDS', async () => {
    const searchPosts = vi.spyOn(AtprotoClient.prototype, 'searchPosts')
    const result = await createAtprotoSearchProvider(() => config()).search({ ...options, query: '  ' })
    expect(result).toMatchObject({ provider: 'atproto', items: [], total: 0 })
    expect(searchPosts).not.toHaveBeenCalled()
  })

  it('signs in with the service account, then maps posts and profiles to hits', async () => {
    const login = vi.spyOn(AtprotoClient.prototype, 'login').mockResolvedValue({} as never)
    const searchPosts = vi.spyOn(AtprotoClient.prototype, 'searchPosts').mockResolvedValue({ posts: [post] })
    vi.spyOn(AtprotoClient.prototype, 'searchActors').mockResolvedValue({ actors: [actor] })

    const result = await createAtprotoSearchProvider(() => config({ identifier: 'svc.test', password: 'pw' })).search(options)

    expect(login).toHaveBeenCalledWith('svc.test', 'pw')
    // 75% of the page to posts, the rest to profiles.
    expect(searchPosts).toHaveBeenCalledWith({ query: 'hello', limit: 3 })
    expect(result.items.map((hit) => hit.id)).toEqual([post.uri, actor.did])
    expect(result.items[0]!.source).toMatchObject({ type: 'atproto_post', url: 'https://bsky.app/profile/alice.test/post/3kabc' })
    expect(result.items[1]!.source).toMatchObject({ type: 'atproto_actor', url: 'https://bsky.app/profile/bob.test' })
    expect(result.total).toBe(2)
  })

  it('keeps the posts when the profile search fails', async () => {
    vi.spyOn(AtprotoClient.prototype, 'searchPosts').mockResolvedValue({ posts: [post] })
    vi.spyOn(AtprotoClient.prototype, 'searchActors').mockRejectedValue(new Error('down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await createAtprotoSearchProvider(() => config()).search(options)

    expect(result.items.map((hit) => hit.id)).toEqual([post.uri])
  })

  it('answers empty when the service-account sign-in fails', async () => {
    vi.spyOn(AtprotoClient.prototype, 'login').mockRejectedValue(new Error('bad password'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await createAtprotoSearchProvider(() => config({ identifier: 'svc.test', password: 'wrong' })).search(options)

    expect(result.items).toEqual([])
  })
})
