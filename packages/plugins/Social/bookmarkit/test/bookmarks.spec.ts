import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, createRouter, toWebHandler } from 'h3'

// ---------------------------------------------------------------------------
// A small in-memory Directus: just the collections and filters the routes use.
type Row = Record<string, any>
let db: Record<string, Row[]>
let nextId: number
const calls: string[] = []

const matches = (row: Row, filter: Row, collection: string): boolean => Object.entries(filter).every(([field, cond]) => {
  if (field === 'user') return db.lists_directus_users.some((j) => j.list_id === row.id && j.user_id === cond.user_id._eq)
  if (field === 'lists_type') {
    const type = db.lists_type.find((t) => t.name === cond.lists_type_id.name._eq)
    return !!type && db.lists_type_lists.some((j) => j.lists_id === row.id && j.lists_type_id === type.id)
  }
  if ('_eq' in cond) return row[field] === cond._eq
  if ('_in' in cond) return cond._in.includes(row[field])
  throw new Error(`fake Directus: unsupported filter on ${collection}.${field}`)
})

function directus(url: string, options: Row = {}) {
  const method = options.method ?? 'GET'
  const [, collection, id] = new URL(url).pathname.match(/^\/items\/([^/]+)(?:\/(\d+))?$/) ?? []
  calls.push(`${method} ${collection}${id ? `/${id}` : ''}`)
  const rows = db[collection]
  if (!rows) throw new Error(`fake Directus: unknown ${url}`)
  if (method === 'GET') {
    const filter = options.query?.filter ? JSON.parse(options.query.filter) : {}
    return { data: rows.filter((r) => matches(r, filter, collection)) }
  }
  if (method === 'POST') {
    const { user, lists_type, ...fields } = options.body
    const row = { id: nextId++, date_created: '2026-10-26T00:00:00Z', ...fields }
    rows.push(row)
    for (const j of user?.create ?? []) db.lists_directus_users.push({ id: nextId++, list_id: row.id, ...j })
    for (const j of lists_type?.create ?? []) db.lists_type_lists.push({ id: nextId++, lists_id: row.id, ...j })
    return { data: row }
  }
  if (method === 'PATCH') {
    const row = rows.find((r) => r.id === Number(id))
    Object.assign(row!, options.body)
    return { data: row }
  }
  if (method === 'DELETE') {
    const doomed = id ? [Number(id)] : options.body
    db[collection] = rows.filter((r) => !doomed.includes(r.id))
    return null
  }
}

// ---------------------------------------------------------------------------
const config = { bookmarkit: { listType: 'Bookmarks', sessionEndpoint: '/api/auth/get-session', directus: { url: 'https://cms.test', token: 't' } } }
let signedIn: string | null
vi.stubGlobal('useRuntimeConfig', () => config)
vi.stubGlobal('$fetch', async (url: string, options: Row) => {
  if (url === '/api/auth/get-session') return signedIn ? { user: { id: signedIn } } : null
  return directus(url, options)
})

const route = async (file: string) => (await import(`../src/runtime/server/api/${file}.ts`)).default
const router = createRouter()
  .get('/api/bookmarks', await route('index.get'))
  .post('/api/bookmarks', await route('index.post'))
  .post('/api/bookmarks/folders', await route('folders.post'))
  .patch('/api/bookmarks/folders/:id', await route('folder.patch'))
  .delete('/api/bookmarks/folders/:id', await route('folder.delete'))
  .patch('/api/bookmarks/:id', await route('bookmark.patch'))
  .delete('/api/bookmarks/:id', await route('bookmark.delete'))
const handle = toWebHandler(createApp().use(router))
const call = async (method: string, path: string, body?: unknown) => {
  const res = await handle(new Request(`https://app.test${path}`, {
    method,
    headers: { cookie: 'session=1', ...(body ? { 'content-type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }))
  const text = await res.text()
  return { status: res.status, body: text ? JSON.parse(text) : null }
}

// Ann (folder 10: one bookmark) and Bob (folder 20: one bookmark), plus a
// Wishlist of Ann's that must never show up as bookmarks.
beforeEach(() => {
  nextId = 1000
  calls.length = 0
  signedIn = 'ann'
  db = {
    lists_type: [{ id: 2, name: 'Wishlist' }, { id: 4, name: 'Bookmarks' }],
    lists: [{ id: 10, name: 'Reading' }, { id: 20, name: "Bob's" }, { id: 30, name: 'Wishes' }],
    lists_directus_users: [{ id: 1, list_id: 10, user_id: 'ann' }, { id: 2, list_id: 20, user_id: 'bob' }, { id: 3, list_id: 30, user_id: 'ann' }],
    lists_type_lists: [{ id: 1, lists_id: 10, lists_type_id: 4 }, { id: 2, lists_id: 20, lists_type_id: 4 }, { id: 3, lists_id: 30, lists_type_id: 2 }],
    list_items: [
      { id: 100, list_id: 10, title: 'Nuxt', link: 'https://nuxt.com/', description: '' },
      { id: 200, list_id: 20, title: 'Secret', link: 'https://bob.example/', description: '' },
      { id: 300, list_id: 30, title: 'A product', link: null, description: '' },
    ],
  }
})

describe('reading', () => {
  it('needs a signed-in user', async () => {
    signedIn = null
    expect((await call('GET', '/api/bookmarks')).status).toBe(401)
    expect(calls).toEqual([])
  })

  it("returns only the user's own bookmark folders and their bookmarks", async () => {
    const { status, body } = await call('GET', '/api/bookmarks')
    expect(status).toBe(200)
    expect(body.folders).toEqual([{ id: 10, name: 'Reading', description: '', count: 1 }])
    expect(body.bookmarks.map((b: Row) => b.id)).toEqual([100])
    expect(body.bookmarks[0]).toMatchObject({ title: 'Nuxt', url: 'https://nuxt.com/', folderId: 10 })
  })
})

describe('adding', () => {
  it('puts a bookmark in the oldest folder, titled after the site when untitled', async () => {
    const { status, body } = await call('POST', '/api/bookmarks', { url: 'www.vuejs.org/guide' })
    expect(status).toBe(201)
    expect(body).toMatchObject({ title: 'vuejs.org', url: 'https://www.vuejs.org/guide', folderId: 10 })
  })

  it('makes a "Bookmarks" folder, owned by the user, when there is none', async () => {
    signedIn = 'cat'
    const { body } = await call('POST', '/api/bookmarks', { url: 'https://example.org', title: 'Example' })
    const folder = db.lists.find((l) => l.id === body.folderId)!
    expect(folder).toMatchObject({ name: 'Bookmarks', type: 'bookmarks', status: 'Private' })
    expect(db.lists_directus_users).toContainEqual(expect.objectContaining({ list_id: folder.id, user_id: 'cat' }))
    expect(db.lists_type_lists).toContainEqual(expect.objectContaining({ lists_id: folder.id, lists_type_id: 4 }))
  })

  it.each(['javascript:alert(1)', 'data:text/html,<b>x</b>', 'ftp://files.example.com', 'not a url', 'localhost', ''])('refuses %j', async (url) => {
    expect((await call('POST', '/api/bookmarks', { url })).status).toBe(400)
    expect(db.list_items).toHaveLength(3)
  })

  it("won't add to someone else's folder or a list that isn't a bookmark folder", async () => {
    expect((await call('POST', '/api/bookmarks', { url: 'https://a.example', folderId: 20 })).status).toBe(404)
    expect((await call('POST', '/api/bookmarks', { url: 'https://a.example', folderId: 30 })).status).toBe(404)
    expect(db.list_items).toHaveLength(3)
  })

  it('refuses an over-long title', async () => {
    expect((await call('POST', '/api/bookmarks', { url: 'https://a.example', title: 'x'.repeat(201) })).status).toBe(400)
  })
})

describe('changing and deleting', () => {
  it('edits and moves a bookmark between the user\'s folders', async () => {
    const folder = (await call('POST', '/api/bookmarks/folders', { name: 'Later' })).body
    const { status, body } = await call('PATCH', '/api/bookmarks/100', { title: 'Nuxt docs', folderId: folder.id })
    expect(status).toBe(200)
    expect(body).toMatchObject({ id: 100, title: 'Nuxt docs', folderId: folder.id })
  })

  it("can't see, edit, move into or delete what isn't the user's", async () => {
    expect((await call('PATCH', '/api/bookmarks/200', { title: 'mine now' })).status).toBe(404)
    expect((await call('DELETE', '/api/bookmarks/200')).status).toBe(404)
    expect((await call('DELETE', '/api/bookmarks/300')).status).toBe(404)
    expect((await call('PATCH', '/api/bookmarks/100', { folderId: 20 })).status).toBe(404)
    expect((await call('PATCH', '/api/bookmarks/folders/20', { name: 'x' })).status).toBe(404)
    expect((await call('DELETE', '/api/bookmarks/folders/20')).status).toBe(404)
    expect(db.list_items.find((i) => i.id === 200)).toMatchObject({ title: 'Secret', list_id: 20 })
    expect(db.lists).toHaveLength(3)
  })

  it('deletes a bookmark', async () => {
    expect((await call('DELETE', '/api/bookmarks/100')).status).toBe(204)
    expect(db.list_items.map((i) => i.id)).toEqual([200, 300])
  })

  it('renames a folder', async () => {
    const { body } = await call('PATCH', '/api/bookmarks/folders/10', { name: 'Docs' })
    expect(body).toMatchObject({ id: 10, name: 'Docs' })
    expect(db.lists.find((l) => l.id === 10)!.name).toBe('Docs')
  })

  it('deletes a folder with its bookmarks and link rows, leaving nothing orphaned', async () => {
    expect((await call('DELETE', '/api/bookmarks/folders/10')).status).toBe(204)
    expect(db.lists.map((l) => l.id)).toEqual([20, 30])
    expect(db.list_items.map((i) => i.id)).toEqual([200, 300])
    expect(db.lists_directus_users.map((j) => j.list_id)).toEqual([20, 30])
    expect(db.lists_type_lists.map((j) => j.lists_id)).toEqual([20, 30])
  })

  it('rejects a non-numeric id', async () => {
    expect((await call('DELETE', '/api/bookmarks/abc')).status).toBe(400)
  })
})
