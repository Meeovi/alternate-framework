import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { importNews, noteSlug, type ImportDeps } from '../runtime/importer'

const day = readFileSync(new URL('./fixtures/2026_October_28.wikitext', import.meta.url), 'utf8')

function setup() {
  const tables: Record<string, Array<Record<string, any>>> = { spaces: [{ id: 106, slug: 'meeovi-news' }], posts: [], tags: [{ id: 5, slug: 'news', name: 'News' }] }
  let next = 1000
  const requests: string[] = []
  const deps: ImportDeps = {
    source: {
      api: 'https://en.wikipedia.org/w/api.php',
      userAgent: 'test',
      async fetch(url) {
        requests.push(url)
        const params = new URL(url).searchParams
        const body = params.get('prop') === 'revisions'
          ? (params.get('titles')!.endsWith('2026_October_28')
            ? { query: { pages: [{ revisions: [{ slots: { main: { content: day } } }] }] } }
            : { query: { pages: [{ missing: true }] } })
          : { query: { pages: [{ title: '2026 Toledo train collision', thumbnail: { source: 'https://upload.wikimedia.org/train.jpg' } }] } }
        return { ok: true, status: 200, json: async () => body }
      },
    },
    async readItems(collection, query: any) {
      const f = query.filter
      const test = (r: Record<string, any>, k: string, c: any) => {
        if (k === 'spaces') return (r.spaces?.create ?? []).some((j: any) => j.spaces_id === c.spaces_id._eq)
        if (c._in) return c._in.map(String).includes(String(r[k]))
        if (c._gte) return String(r[k]) >= c._gte
        return r[k] === c._eq
      }
      return (tables[collection] ?? []).filter((r) => !f || Object.entries(f).every(([k, c]) => test(r, k, c)))
    },
    async createItem(collection, item) {
      const row: Record<string, any> = { id: next++, ...item }
      // Like the "[Website] Slugify" flow: the slug becomes the title's.
      if (collection === 'posts') row.slug = String(item.title).toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
      ;(tables[collection] ??= []).push(row)
      return row
    },
    async updateItem(collection, id, item) {
      const row = tables[collection]!.find((r) => r.id === id)!
      Object.assign(row, item)
      return row
    },
    settle: async () => {},
  }
  return { tables, deps, requests }
}

describe('news import', () => {
  it('adds each event as a public, credited note in the space, tagged', async () => {
    const { tables, deps } = setup()
    const result = await importNews(deps, { space: 'meeovi-news', days: 2, today: new Date('2026-10-29T10:00:00Z') })
    expect(result).toMatchObject({ added: 14, skipped: 0, days: ['2026-10-28'], errors: [] })
    const train = tables.posts!.find((p) => p.title === '2026 Toledo train collision')!
    expect(train).toMatchObject({
      status: 'published', visibility_scope: 'public', username: 'Meeovi News', date_published: '2026-10-28T12:00:00.000Z',
      image_url: 'https://upload.wikimedia.org/train.jpg',
      spaces: { create: [{ spaces_id: 106 }] },
    })
    expect(train.content).toContain('CC BY-SA 4.0')
    expect(train.content).toContain('Portal:Current_events/2026_October_28')
    expect(train.content).toContain('>Sky News</a>')
    // Its section and #news (existing tag reused, section tag created once).
    const tagIds = train.tags.create.map((t: any) => t.tags_id)
    expect(tagIds).toContain(5)
    expect(tables.tags!.filter((t) => t.slug === 'disastersandaccidents')).toHaveLength(1)
  })

  it('gives back unique slugs a flow replaced with the title\'s', async () => {
    const { tables, deps } = setup()
    await importNews(deps, { space: 'meeovi-news', days: 1, today: new Date('2026-10-28T12:00:00Z') })
    const slugs = tables.posts!.map((p) => p.slug)
    expect(slugs.every((s) => /^news-2026-10-28-[0-9a-f]{10}$/.test(s))).toBe(true)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('adds only what is new on the next run', async () => {
    const { deps } = setup()
    await importNews(deps, { space: 'meeovi-news', days: 1, today: new Date('2026-10-28T20:00:00Z') })
    const again = await importNews(deps, { space: 'meeovi-news', days: 1, today: new Date('2026-10-28T21:00:00Z') })
    expect(again).toMatchObject({ added: 0, skipped: 14 })
  })

  it('stops at the limit, and refuses an unknown space', async () => {
    const { deps } = setup()
    expect((await importNews(deps, { space: 'meeovi-news', days: 1, limit: 3, today: new Date('2026-10-28T12:00:00Z') })).added).toBe(3)
    await expect(importNews(deps, { space: 'nope' })).rejects.toThrow(/No space/)
  })

  it('knows notes saved before keys were stored, from their title, day and source', async () => {
    const { tables, deps } = setup()
    await importNews(deps, { space: 'meeovi-news', days: 1, today: new Date('2026-10-28T12:00:00Z') })
    for (const p of tables.posts!) delete p.link_preview.key
    const again = await importNews(deps, { space: 'meeovi-news', days: 1, today: new Date('2026-10-28T13:00:00Z') })
    expect(again).toMatchObject({ added: 0, skipped: 14 })
  })

  it('gives each note a stable slug', () => {
    const item = { date: '2026-10-28', title: 'T', text: 'x', sources: [{ url: 'https://a', name: 'A' }] } as any
    expect(noteSlug(item)).toBe(noteSlug({ ...item, text: 'edited' }))
    expect(noteSlug(item)).toMatch(/^news-2026-10-28-[0-9a-f]{10}$/)
  })
})
