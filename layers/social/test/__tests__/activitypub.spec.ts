import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createFederation, MemoryKvStore } from '@fedify/fedify'
import { Announce, Create, Note, Video } from '@fedify/vocab'

// The database and Directus are mocked: nothing is read or written.
const state = vi.hoisted(() => ({
  members: [] as any[],
  directus: {} as Record<string, any[]>,
  settings: {} as Record<string, any>,
  outbox: [] as any[],
}))

vi.mock('#auth/server/utils/drizzle', () => ({ db: {} }))
vi.mock('#auth/server/database/migrations/schema', () => ({ apActorKeys: {}, apFollowers: {}, apInteractions: {}, apOutbox: {}, users: {} }))
vi.mock('../../server/utils/activitypub/store', () => ({
  federatedMember: async (by: { id?: string, username?: string }) => state.members.find((m) => (by.id ? m.id === by.id : m.username === by.username)) ?? null,
  readApSettings: async (id: string) => state.settings[id] ?? { enabled: false, shop: false, since: null },
  shopPostedProducts: async () => new Set<string>(),
  findPublished: async (type: string, id: string) => state.outbox.find((r) => r.objectType === type && r.objectId === id) ?? null,
}))
vi.mock('@directus/sdk', () => {
  const client: any = { with: () => client, request: async (op: any) => op() }
  return {
    createDirectus: () => client, rest: () => ({}), staticToken: () => ({}),
    readItems: (collection: string, query: any) => async () => {
      const rows = state.directus[collection] ?? []
      const id = JSON.stringify(query.filter ?? {}).match(/"id":\{"_eq":"?([\w-]+)"?\}/)?.[1]
      const slug = JSON.stringify(query.filter ?? {}).match(/"slug":\{"_eq":"([\w.-]+)"\}/)?.[1]
      return rows.filter((r) => (id ? String(r.id) === id : slug ? r.slug === slug : true))
    },
  }
})

process.env.NUXT_PUBLIC_SITE_URL = 'https://meeovi.com'
process.env.DIRECTUS_URL = 'https://cms.example.com'

const config = await import('../../server/utils/activitypub/config')
const actors = await import('../../server/utils/activitypub/actors')
const content = await import('../../server/utils/activitypub/content')
const { localItem } = await import('../../server/utils/activitypub/interactions')

// A real Fedify context (in memory) for building ids.
const federation = createFederation<unknown>({ kv: new MemoryKvStore(), origin: 'https://meeovi.com' })
federation.setActorDispatcher('/ap/actors/{identifier}', async () => null)
federation.setFollowersDispatcher('/ap/actors/{identifier}/followers', async () => null)
federation.setObjectDispatcher(Note, '/ap/notes/{id}', async () => null)
federation.setObjectDispatcher(Video, '/ap/vibez/{id}', async () => null)
const ctx = federation.createContext(new URL('https://meeovi.com'), undefined)

const MEMBER = { id: '01a1b312-dc0a-70fb-b448-3b7e5c9edcd3', username: 'alice', name: 'Alice', image: null, role: 'user,seller', since: '2026-11-07T00:00:00Z', shop: true, createdAt: new Date('2026-01-01') }

beforeEach(() => {
  state.members = [MEMBER]
  state.directus = {}
  state.settings = { [MEMBER.id]: { enabled: true, shop: true, since: MEMBER.since } }
  state.outbox = []
})

describe('identifiers and handles', () => {
  it('parses each kind of account and refuses anything else', () => {
    expect(config.parseIdentifier(`u-${MEMBER.id}`)).toEqual({ kind: 'member', key: MEMBER.id })
    expect(config.parseIdentifier('shop-alice')).toEqual({ kind: 'shop', key: 'alice' })
    expect(config.parseIdentifier('meeovi')).toEqual({ kind: 'site', key: 'meeovi' })
    expect(config.parseIdentifier('space-12')).toEqual({ kind: 'space', key: '12' })
    expect(config.parseIdentifier('list-3')).toEqual({ kind: 'list', key: '3' })
    for (const bad of ['u-nope', 'shop-../x', 'space-abc', 'list-', 'alice', 'admin']) expect(config.parseIdentifier(bad)).toBeNull()
  })

  it('maps handles to accounts only while their owner allows it', async () => {
    expect(await actors.identifierForHandle('alice')).toBe(`u-${MEMBER.id}`)
    expect(await actors.identifierForHandle('ALICE')).toBe(`u-${MEMBER.id}`)
    expect(await actors.identifierForHandle('shop-alice')).toBe('shop-alice')
    expect(await actors.identifierForHandle('meeovi')).toBe('meeovi')
    expect(await actors.identifierForHandle('bob')).toBeNull()
    // A member who isn't a seller has no shop.
    state.members = [{ ...MEMBER, role: 'user' }]
    expect(await actors.identifierForHandle('shop-alice')).toBeNull()
    // Shop switch off.
    state.members = [{ ...MEMBER, shop: false }]
    expect(await actors.identifierForHandle('shop-alice')).toBeNull()
  })

  it('serves spaces only when public, federated and open', async () => {
    state.directus.spaces = [
      { id: 5, slug: 'gardening', name: 'Gardening', status: 'Public', federation_enabled: true, invite_only: false },
      { id: 6, slug: 'secret', name: 'Secret', status: 'public', federation_enabled: true, invite_only: true },
      { id: 7, slug: 'plain', name: 'Plain', status: 'public', federation_enabled: null },
    ]
    expect((await actors.spaceActor({ id: '5' }))?.handle).toBe('space-gardening')
    expect(await actors.identifierForHandle('space-gardening')).toBe('space-5')
    expect(await actors.spaceActor({ id: '6' })).toBeNull()
    expect(await actors.spaceActor({ id: '7' })).toBeNull()
  })

  it('serves a list only when it is public and its owner is on the fediverse', async () => {
    state.directus.lists = [{ id: 3, name: 'Gifts', status: 'Public', user: [{ user_id: MEMBER.id }] }, { id: 4, name: 'Mine', status: 'private', user: [{ user_id: MEMBER.id }] }]
    expect((await actors.listActor('3'))?.summary).toContain('@alice')
    expect(await actors.listActor('4')).toBeNull()
    state.settings[MEMBER.id] = { enabled: false, shop: false, since: null }
    expect(await actors.listActor('3')).toBeNull()
  })
})

describe('objects', () => {
  it('builds a note with safe HTML, hashtags, its image and a link back', async () => {
    const note = content.noteObject(ctx as any, `u-${MEMBER.id}`, {
      id: 12, slug: 'hello', content: '<p>Hi <script>x</script><b>all</b> #Garden</p>', image_url: 'https://img.example.com/a.png', date_created: '2026-11-07T01:00:00Z',
    })
    expect(note.id?.href).toBe('https://meeovi.com/ap/notes/12')
    expect(note.attributionId?.href).toBe(`https://meeovi.com/ap/actors/u-${MEMBER.id}`)
    const html = note.content!.toString()
    expect(html).not.toContain('<script')
    expect(html).toContain('href="https://meeovi.com/connect/hashtag/garden"')
    expect(html).toContain('href="https://meeovi.com/connect/note/hello"')
    expect((await note.toJsonLd() as any).cc).toBe(`https://meeovi.com/ap/actors/u-${MEMBER.id}/followers`)
    const [image] = await Array.fromAsync(note.getAttachments())
    expect((image as any).url.href).toBe('https://img.example.com/a.png')
  })

  it('builds a product post with its price and shop link', () => {
    const note = content.productObject(ctx as any, 'shop-alice', { id: 45, slug: 'loop-4', name: 'Loop 4', price: '0', short_description: '<p>Free loop</p>' })
    expect(note.id?.href).toBe('https://meeovi.com/ap/notes/product-45')
    expect(note.content!.toString()).toContain('New on Meeovi: Loop 4 (Free)')
    expect(note.url instanceof URL && note.url.href).toBe('https://meeovi.com/product/loop-4')
  })

  it('builds a vibe as a Video with its file and tagged products', () => {
    const video = content.vibeObject(ctx as any, `u-${MEMBER.id}`, { id: 50, name: 'My vibe', video_url: 'https://pix.example.com/v.mp4', description: 'Look #fit' }, [{ id: 7, slug: 'lamp', name: 'Lamp' }])
    expect(video.id?.href).toBe('https://meeovi.com/ap/vibez/50')
    expect(video.content!.toString()).toContain('Shop this vibe: <a href="https://meeovi.com/product/lamp">Lamp</a>')
  })

  it('maps our object URIs back to Meeovi items, and nothing else', () => {
    const item = (uri: string) => localItem(ctx as any, new URL(uri))
    expect(item('https://meeovi.com/ap/notes/12')).toEqual({ objectType: 'note', objectId: '12' })
    expect(item('https://meeovi.com/ap/notes/product-45')).toEqual({ objectType: 'product', objectId: '45' })
    expect(item('https://meeovi.com/ap/notes/list-item-9')).toEqual({ objectType: 'list_item', objectId: '9' })
    expect(item('https://meeovi.com/ap/vibez/50')).toEqual({ objectType: 'vibe', objectId: '50' })
    expect(item('https://meeovi.com/ap/notes/evil')).toBeNull()
    expect(item('https://mastodon.social/ap/notes/12')).toBeNull()
  })
})

describe('outbox activities', () => {
  it('lists boosted products and space posts as Announces, the rest as Creates', async () => {
    const { outboxActivity } = await import('../../server/utils/activitypub/setup')
    const row = (identifier: string, objectType: string, objectId: string) => ({ id: 'x', identifier, objectType, objectId, publishedAt: new Date(), updatedAt: null, deletedAt: null })
    const shopPosted = new Set(['45'])
    expect(outboxActivity(ctx as any, row(`u-${MEMBER.id}`, 'note', '12') as any, shopPosted)).toBeInstanceOf(Create)
    expect(outboxActivity(ctx as any, row('shop-alice', 'product', '45') as any, shopPosted)).toBeInstanceOf(Create)
    expect(outboxActivity(ctx as any, row('meeovi', 'product', '45') as any, shopPosted)).toBeInstanceOf(Announce)
    expect(outboxActivity(ctx as any, row('space-5', 'space_post', '12') as any, shopPosted)).toBeInstanceOf(Announce)
    // A product from a seller without a fediverse shop: the site posts it itself.
    expect(outboxActivity(ctx as any, row('meeovi', 'product', '46') as any, shopPosted)).toBeInstanceOf(Create)
  })
})

describe('reserved usernames', () => {
  it("keeps 'meeovi' (the site's account) and lookalikes from members", async () => {
    const { isAllowedUsername } = await import('../../../auth/shared/utils/username')
    expect(isAllowedUsername('meeovi')).toBe(false)
    expect(isAllowedUsername('me3ovi')).toBe(false)
    expect(isAllowedUsername('alice')).toBe(true)
  })
})
