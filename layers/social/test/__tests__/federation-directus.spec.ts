import { describe, expect, it, vi } from 'vitest'
import { createDirectusNetwork, toPlainText, type DirectusNetworkDeps, type MemberRow } from '../../server/utils/federation-directus'

const alice: MemberRow = { id: '11111111-1111-4111-8111-111111111111', name: 'Alice', username: 'alice', image: 'https://cdn.test/a.jpg' }

const post = (id: number, extra: Record<string, unknown> = {}) => ({
  id,
  slug: `post-${id}`,
  content: '<p>Hello &amp; welcome #Meeovi</p>',
  date_created: '2026-10-12T10:00:00.000Z',
  creator_id: alice.id,
  ...extra,
})

function deps(overrides: Partial<DirectusNetworkDeps> = {}): DirectusNetworkDeps {
  return {
    service: 'https://cms.test',
    siteUrl: 'https://site.test/',
    readItems: vi.fn(async () => []),
    ping: vi.fn(async () => {}),
    findMember: vi.fn(async (handle: string) => (handle === 'alice' || handle === alice.id ? alice : null)),
    findMembers: vi.fn(async (ids: string[]) => (ids.includes(alice.id) ? [alice] : [])),
    ...overrides,
  }
}

const filterOf = (mock: unknown, call = 0) => JSON.stringify((mock as ReturnType<typeof vi.fn>).mock.calls[call]![1].filter)

describe('directus federation network', () => {
  it('reports status from a Directus ping', async () => {
    expect(await createDirectusNetwork(deps()).status()).toEqual({ configured: true, connected: true, service: 'https://cms.test' })
    const down = await createDirectusNetwork(deps({ ping: async () => { throw new Error('ECONNREFUSED') } })).status()
    expect(down).toMatchObject({ configured: true, connected: false, detail: 'ECONNREFUSED' })
  })

  it('maps a member to a profile with follow and post counts', async () => {
    const readItems = vi.fn(async (_c: string, q: Record<string, any>) => {
      const f = JSON.stringify(q.filter)
      if (f.includes('target_id')) return [{ count: { id: '3' } }]
      if (f.includes('follower_id')) return [{ count: { id: '2' } }]
      return [{ count: { id: '5' } }]
    })
    const profile = await createDirectusNetwork(deps({ readItems })).profile!('alice')
    expect(profile).toEqual({
      id: alice.id, network: 'directus', handle: 'alice', displayName: 'Alice', avatar: alice.image,
      url: 'https://site.test/u/alice', followers: 3, following: 2, posts: 5,
    })
    expect(await createDirectusNetwork(deps()).profile!('nobody')).toBeNull()
  })

  it('feed: only that member\'s published, public posts, as plain text with hashtags and links', async () => {
    const readItems = vi.fn(async () => [post(7, { image: 'file-uuid' })])
    const [first] = await createDirectusNetwork(deps({ readItems })).feed!('@alice', { limit: 5 })

    expect(first).toMatchObject({
      id: '7', network: 'directus', text: 'Hello & welcome #Meeovi', hashtags: ['meeovi'],
      url: 'https://site.test/connect/note/post-7',
      media: [{ url: 'https://cms.test/assets/file-uuid', type: 'image' }],
      author: { id: alice.id, handle: 'alice' },
    })
    const filter = filterOf(readItems)
    expect(filter).toContain(alice.id)
    expect(filter).toContain('"status":{"_in":["published","Published","public","Public"]}')
    expect(filter).toContain('visibility_scope')
    expect((readItems.mock.calls[0] as any)[1].limit).toBe(5)
  })

  it('feed for an unknown or hidden member is empty, without reading posts', async () => {
    const readItems = vi.fn(async () => [post(1)])
    expect(await createDirectusNetwork(deps({ readItems })).feed!('ghost')).toEqual([])
    expect(readItems).not.toHaveBeenCalled()
  })

  it('search: public posts matching the text, dropping posts by hidden members', async () => {
    const hidden = '22222222-2222-4222-8222-222222222222'
    const readItems = vi.fn(async () => [
      post(1),
      post(2, { creator_id: hidden }),
      post(3, { creator_id: null, username: 'Old Timer', user_avatar: 'https://cdn.test/o.jpg' }),
    ])
    const posts = await createDirectusNetwork(deps({ readItems })).searchPosts!('welcome')

    expect(posts.map((p) => p.id)).toEqual(['1', '3'])
    expect(posts[1]!.author).toMatchObject({ handle: 'Old Timer', avatar: 'https://cdn.test/o.jpg' })
    expect(filterOf(readItems)).toContain('"_icontains":"welcome"')
    expect(await createDirectusNetwork(deps()).searchPosts!('   ')).toEqual([])
  })

  it('omits links when no site URL is configured', async () => {
    const readItems = vi.fn(async () => [post(1)])
    const [first] = await createDirectusNetwork(deps({ readItems, siteUrl: undefined })).feed!('alice')
    expect(first!.url).toBeUndefined()
    expect(first!.author.url).toBeUndefined()
  })

  it('toPlainText strips markup and scripts', () => {
    expect(toPlainText('<script>x()</script><p>a</p><p>b &lt;3</p>')).toBe('a\nb <3')
    expect(toPlainText(null)).toBe('')
  })
})
