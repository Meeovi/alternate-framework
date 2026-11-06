import { beforeEach, describe, expect, it, vi } from 'vitest'

// -- mocks ----------------------------------------------------------------------
// Each db.select(...) chain resolves to the next queued result; inserts and
// deletes are recorded.
const selects: unknown[][] = []
const inserted: Record<string, unknown>[] = []
const deleted: unknown[] = []
const chain = (result: () => unknown[]) => {
  const builder: any = new Proxy({}, {
    get: (_t, key) => key === 'then'
      ? (resolve: (v: unknown) => void, reject: (e: unknown) => void) => Promise.resolve(result()).then(resolve, reject)
      : () => builder,
  })
  return builder
}
vi.mock('#auth/server/utils/drizzle', () => ({
  db: {
    select: () => chain(() => selects.shift() ?? []),
    insert: () => ({ values: (row: Record<string, unknown>) => ({ onConflictDoNothing: async () => { inserted.push(row) } }) }),
    delete: () => ({ where: async (w: unknown) => { deleted.push(w) } }),
  },
}))
vi.mock('#auth/server/database/migrations/schema', () => ({
  atprotoCrossposts: { $inferInsert: {}, id: 'id', sourceId: 'source_id', sourceType: 'source_type', createdAt: 'created_at', uri: 'uri' },
  atprotoSessions: {},
  users: {},
}))
vi.mock('drizzle-orm', () => {
  const op = (...args: unknown[]) => args
  return { and: op, desc: op, eq: op, gte: op, inArray: op, isNull: op, or: op, sql: op }
})
vi.mock('#shared/server/utils/redis', () => ({ redis: { set: async () => 'OK', del: async () => 1 } }))

// Directus: reads answer from `directus[collection]` (or throw).
const directus: Record<string, Record<string, unknown>[] | Error> = {}
const reads: Array<{ collection: string, query: any }> = []
vi.mock('@directus/sdk', () => ({
  createDirectus: () => ({ with: () => ({ with: () => ({ request: async (r: { collection: string, query: unknown }) => {
    reads.push(r)
    const answer = directus[r.collection]
    if (answer instanceof Error) throw answer
    return answer ?? []
  } }) }) }),
  rest: () => ({}),
  staticToken: () => ({}),
  readItems: (collection: string, query: unknown) => ({ collection, query }),
}))

const created: any[] = []
const deletedPosts: string[] = []
const site = { did: 'did:plc:site', createPost: async (opts: any) => { created.push(opts); return { uri: `at://did:plc:site/app.bsky.feed.post/${created.length}`, cid: 'cid' } }, deletePost: async (uri: string) => { deletedPosts.push(uri) }, uploadImage: async () => ({}) }
vi.mock('@mframework/meeovi-atproto/client', () => ({ useAtprotoClient: () => site }))
vi.mock('@mframework/meeovi-atproto/linkcard', () => ({ linkCardEmbed: async (_c: unknown, card: any) => ({ uri: card.url, title: card.title, description: card.description }) }))
vi.mock('../../server/utils/federation-members', () => ({ openMemberSession: async () => null }))
vi.mock('../../server/utils/federation', () => ({ useFederationNetwork: () => ({ id: 'atproto' }) }))

process.env.NUXT_PUBLIC_SITE_URL = 'https://meeovi.com'
process.env.DIRECTUS_URL = 'https://cms.example.com'
const { clip, notePost, priceLabel, productPost, runCrosspost } = await import('../../server/utils/crosspost')

beforeEach(() => {
  selects.length = 0; inserted.length = 0; deleted.length = 0; created.length = 0; deletedPosts.length = 0; reads.length = 0
  for (const key of Object.keys(directus)) delete directus[key]
  process.env.ATPROTO_CROSSPOST = 'true'
})

// -- text -------------------------------------------------------------------------

describe('post text', () => {
  it('clips at a word boundary with an ellipsis, counting graphemes', () => {
    expect(clip('short', 300)).toBe('short')
    const out = clip('word '.repeat(100), 50)
    expect([...new Intl.Segmenter().segment(out)].length).toBeLessThanOrEqual(50)
    expect(out.endsWith('word…')).toBe(true)
    expect(clip('👍🏽'.repeat(10), 5)).toBe('👍🏽👍🏽👍🏽👍🏽…')
  })

  it('labels free and paid prices', () => {
    expect(priceLabel('0.00000')).toBe('Free')
    expect(priceLabel(null)).toBe('Free')
    expect(priceLabel('9.5', 'usd')).toBe('$9.50')
    expect(priceLabel(12, 'EUR')).toBe('€12.00')
  })

  it('posts a product with its price, description and a card to its page', () => {
    const { text, card } = productPost({ id: 224, slug: 'frog-loop', name: 'Frog Loop', price: '0', short_description: '<p>Free loopable &amp; fun.</p>', image_url: 'https://commerce.example.com/a.jpg' })
    expect(text).toBe('New on Meeovi: Frog Loop (Free)\n\nFree loopable & fun.')
    expect(card).toEqual({ url: 'https://meeovi.com/product/frog-loop', title: 'Frog Loop', description: 'Free loopable & fun.', image: 'https://commerce.example.com/a.jpg' })
  })

  it('keeps a long product post within 300 graphemes', () => {
    const { text } = productPost({ id: 1, name: 'A'.repeat(200), price: 5, short_description: 'b '.repeat(400) })
    expect([...new Intl.Segmenter().segment(text)].length).toBeLessThanOrEqual(300)
  })

  it('posts a note as its text with a card back to Meeovi, using Directus images', () => {
    const post = notePost({ id: 7, slug: 'hello', title: 'Hello', content: '<p>Hi <b>all</b></p>', image: 'abcd1234-ef' })
    expect(post).toEqual({ text: 'Hi all', card: { url: 'https://meeovi.com/connect/note/hello', title: 'Hello', description: 'Hi all', image: 'https://cms.example.com/assets/abcd1234-ef' } })
    expect(notePost({ id: 8, content: '', title: '' })).toBeNull()
    // Non-https image links are left out.
    expect(notePost({ id: 9, content: 'x', image_url: 'http://127.0.0.1/secret' })!.card.image).toBeUndefined()
  })
})

// -- runs ---------------------------------------------------------------------------

describe('runCrosspost', () => {
  it('does nothing unless ATPROTO_CROSSPOST=true', async () => {
    process.env.ATPROTO_CROSSPOST = ''
    expect(await runCrosspost()).toBeNull()
    expect(reads).toHaveLength(0)
  })

  it('posts the oldest unposted products first, a few per run, and records them', async () => {
    directus.products = [
      { id: 4, name: 'Four', price: 1, created_at: '2026-11-04T00:00:00Z' },
      { id: 3, name: 'Three', price: 0, created_at: '2026-11-03T00:00:00Z' },
      { id: 2, name: 'Two', price: 0, created_at: '2026-11-02T00:00:00Z' },
      { id: 1, name: 'One', price: 0, created_at: '2026-11-01T00:00:00Z' },
    ]
    selects.push([{ id: '1' }]) // product 1 is already posted
    selects.push([]) // no members opted in
    const result = await runCrosspost()
    expect(result).toEqual({ products: 2, notes: 0, removed: 0 })
    expect(created.map((c) => c.text.split(' (')[0])).toEqual(['New on Meeovi: Two', 'New on Meeovi: Three'])
    expect(inserted.map((r) => r.sourceId)).toEqual(['2', '3'])
    expect(inserted[0]).toMatchObject({ sourceType: 'product', authorDid: 'did:plc:site', uri: 'at://did:plc:site/app.bsky.feed.post/1' })
    // Only published products from the last 30 days.
    expect(JSON.stringify(reads[0]!.query.filter)).toContain('"status":{"_eq":"published"}')
  })

  it('deletes the posts of unpublished products', async () => {
    directus.products = [{ id: 2 }] // only product 2 is still published
    const rows = [
      { id: 'a', sourceType: 'product', sourceId: '1', uri: 'at://did:plc:site/app.bsky.feed.post/a', userId: null },
      { id: 'b', sourceType: 'product', sourceId: '2', uri: 'at://did:plc:site/app.bsky.feed.post/b', userId: null },
    ]
    selects.push([{ id: '2' }]) // products step: 2 already posted
    selects.push([]) // no members opted in
    selects.push(rows) // crossposts to check
    const result = await runCrosspost({ removeUnpublished: true })
    expect(result!.removed).toBe(1)
    expect(deletedPosts).toEqual(['at://did:plc:site/app.bsky.feed.post/a'])
  })

  it('never deletes when the check fails or most items vanish at once', async () => {
    const rows = Array.from({ length: 6 }, (_, i) => ({ id: `r${i}`, sourceType: 'product', sourceId: String(i), uri: `at://did:plc:site/app.bsky.feed.post/${i}`, userId: null }))
    // Directus down: the read throws.
    directus.products = new Error('Directus is down')
    selects.push([], rows)
    expect((await runCrosspost({ removeUnpublished: true }))!.removed).toBe(0)
    // Directus answers, but none of the 6 are there (no new products either,
    // so the products step makes no query: members, then the crossposts).
    directus.products = []
    selects.push([], rows)
    expect((await runCrosspost({ removeUnpublished: true }))!.removed).toBe(0)
    expect(selects).toEqual([]) // both runs reached the check
    expect(deletedPosts).toEqual([])
    expect(deleted).toEqual([])
  })
})
