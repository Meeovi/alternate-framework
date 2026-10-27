import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, createRouter, toWebHandler } from 'h3'
import { displayName, kindOf, sanitizeSegment, toEntries } from '../src/runtime/server/utils/gallery'

// ---------------------------------------------------------------------------
// A small fake Nextcloud: the service account's files and public links, and
// the two calls the gallery makes (WebDAV SEARCH, OCS share list).
type File = { path: string, type: string, size: number, modified: string }
let files: File[]
let shares: { path: string, token: string }[]
const requests: string[] = []

const NC = 'https://pix.test'
const SVC = 'svc'
const UUID = '3e306171-f53b-4703-a5a4-18ef0d70dd39'

function davResponse(file: File) {
  return `<d:response><d:href>/remote.php/dav/files/${SVC}${file.path.split('/').map(encodeURIComponent).join('/')}</d:href>`
    + `<d:propstat><d:prop><d:getcontenttype>${file.type}</d:getcontenttype><d:getcontentlength>${file.size}</d:getcontentlength>`
    + `<d:getlastmodified>${new Date(file.modified).toUTCString()}</d:getlastmodified></d:prop></d:propstat></d:response>`
}

async function nextcloud(url: string, init: RequestInit = {}) {
  const method = init.method ?? 'GET'
  requests.push(`${method} ${new URL(url).pathname}`)
  if (method === 'SEARCH') {
    const body = String(init.body)
    const scope = decodeURIComponent(/<d:href>([^<]+)<\/d:href>/.exec(body)![1]!).replace(`/files/${SVC}`, '')
    const types = [...body.matchAll(/<d:literal>([^<%]+)%<\/d:literal>/g)].map((m) => m[1]!)
    const limit = Number(/<d:nresults>(\d+)/.exec(body)![1])
    const found = files
      .filter((f) => f.path.startsWith(`${scope}/`))
      .filter((f) => !types.length || types.some((t) => f.type.startsWith(t)))
      .sort((a, b) => b.modified.localeCompare(a.modified))
      .slice(0, limit)
    if (!files.some((f) => f.path.startsWith(`${scope}/`))) return new Response('', { status: 404 })
    return new Response(`<?xml version="1.0"?><d:multistatus xmlns:d="DAV:">${found.map(davResponse).join('')}</d:multistatus>`, { status: 207 })
  }
  if (url.startsWith(`${NC}/ocs/v2.php/apps/files_sharing/api/v1/shares`)) {
    const data = shares.map((s) => ({ share_type: 3, path: s.path, url: `${NC}/s/${s.token}` }))
    return new Response(JSON.stringify({ ocs: { data } }), { status: 200 })
  }
  throw new Error(`fake Nextcloud: unexpected ${method} ${url}`)
}

// ---------------------------------------------------------------------------
const config = {
  meeoviGallery: { sessionEndpoint: '/api/auth/get-session', pixanomy: {} },
  // The gallery falls back to the app's own Pixanomy settings.
  pixanomy: { url: NC, username: SVC, appPassword: 'pw', root: 'Meeovi' },
}
let signedIn: string | null
vi.stubGlobal('useRuntimeConfig', () => config)
vi.stubGlobal('$fetch', async (url: string) => {
  if (url === '/api/auth/get-session') return signedIn ? { user: { id: signedIn } } : null
  throw new Error(`unexpected $fetch ${url}`)
})
vi.stubGlobal('fetch', nextcloud)

const route = async (file: string) => (await import(`../src/runtime/server/api/${file}.ts`)).default
const router = createRouter()
  .get('/api/gallery/files', await route('files.get'))
  .get('/api/gallery/recent', await route('recent.get'))
const handle = toWebHandler(createApp().use(router))
const get = async (path: string) => {
  const res = await handle(new Request(`https://app.test${path}`, { headers: { cookie: 'session=1' } }))
  const text = await res.text()
  return { status: res.status, body: text ? JSON.parse(text) : null, cache: res.headers.get('cache-control') }
}

// Ann has a post photo, a vibe video, an avatar and a PDF; Bob has a photo
// that must never show up in Ann's gallery.
beforeEach(() => {
  requests.length = 0
  signedIn = 'ann'
  files = [
    { path: `/Meeovi/ann/posts/2026-10/${UUID}-beach.jpg`, type: 'image/jpeg', size: 1000, modified: '2026-10-20T10:00:00Z' },
    { path: `/Meeovi/ann/vibez/2026-09/${UUID}-clip.mp4`, type: 'video/mp4', size: 5000, modified: '2026-09-02T10:00:00Z' },
    { path: `/Meeovi/ann/avatars/2026-09/${UUID}-avatar.png`, type: 'image/png', size: 200, modified: '2026-09-01T10:00:00Z' },
    { path: `/Meeovi/ann/posts/2026-10/${UUID}-notes.pdf`, type: 'application/pdf', size: 300, modified: '2026-10-21T10:00:00Z' },
    { path: `/Meeovi/bob/posts/2026-10/${UUID}-secret.jpg`, type: 'image/jpeg', size: 999, modified: '2026-10-22T10:00:00Z' },
  ]
  shares = [
    { path: `/Meeovi/ann/posts/2026-10/${UUID}-beach.jpg`, token: 'beach' },
    { path: `/Meeovi/ann/vibez/2026-09/${UUID}-clip.mp4`, token: 'clip' },
    { path: `/Meeovi/ann/avatars/2026-09/${UUID}-avatar.png`, token: 'avatar' },
    { path: `/Meeovi/ann/posts/2026-10/${UUID}-notes.pdf`, token: 'notes' },
    { path: `/Meeovi/bob/posts/2026-10/${UUID}-secret.jpg`, token: 'secret' },
  ]
})

describe('GET /api/gallery/files', () => {
  it('needs a signed-in user and asks Pixanomy nothing otherwise', async () => {
    signedIn = null
    expect((await get('/api/gallery/files')).status).toBe(401)
    expect(requests).toEqual([])
  })

  it("lists only the user's own files, as folders by category and month", async () => {
    const { status, body, cache } = await get('/api/gallery/files')
    expect(status).toBe(200)
    expect(cache).toBe('private, no-store')
    const ids = body.files.map((f: { id: string }) => f.id)
    expect(ids).toEqual([
      '/posts', '/posts/2026-10', '/vibez', '/vibez/2026-09', '/avatars', '/avatars/2026-09',
      '/posts/2026-10/notes.pdf', '/posts/2026-10/beach.jpg', '/vibez/2026-09/clip.mp4', '/avatars/2026-09/avatar.png',
    ])
    expect(JSON.stringify(body)).not.toContain('secret')
    expect(body.drive).toEqual({ used: 6500 })
  })

  it('gives every file its public links and media kind', async () => {
    const { body } = await get('/api/gallery/files')
    const beach = body.files.find((f: { id: string }) => f.id.endsWith('beach.jpg'))
    expect(beach).toMatchObject({
      type: 'file', size: 1000, contentType: 'image/jpeg', kind: 'image',
      url: `${NC}/s/beach/download`, shareUrl: `${NC}/s/beach`, date: '2026-10-20T10:00:00.000Z',
    })
    expect(body.files.find((f: { id: string }) => f.id.endsWith('notes.pdf')).kind).toBe('other')
  })

  it('makes one search and one share-list call, not one per file', async () => {
    await get('/api/gallery/files')
    expect(requests).toEqual(['SEARCH /remote.php/dav/', 'GET /ocs/v2.php/apps/files_sharing/api/v1/shares'])
  })

  it('is empty, not an error, before the first upload', async () => {
    signedIn = 'cara'
    expect((await get('/api/gallery/files')).body).toEqual({ files: [], drive: { used: 0 } })
  })
})

describe('GET /api/gallery/recent', () => {
  it('returns the latest photos and videos with links, newest first', async () => {
    const { body } = await get('/api/gallery/recent?limit=2')
    expect(body.media.map((m: { name: string }) => m.name)).toEqual(['beach.jpg', 'clip.mp4'])
    expect(body.media[0]).toMatchObject({ kind: 'image', url: `${NC}/s/beach/download`, category: 'posts' })
  })

  it('filters by type', async () => {
    const { body } = await get('/api/gallery/recent?type=video')
    expect(body.media.map((m: { name: string }) => m.name)).toEqual(['clip.mp4'])
  })

  it('skips files that have no public link', async () => {
    shares = shares.filter((s) => s.token !== 'beach')
    const { body } = await get('/api/gallery/recent')
    expect(body.media.map((m: { name: string }) => m.name)).toEqual(['clip.mp4', 'avatar.png'])
  })

  it('caps the limit at 50', async () => {
    let asked = 0
    vi.stubGlobal('fetch', async (url: string, init: RequestInit = {}) => {
      if (init.method === 'SEARCH') asked = Number(/<d:nresults>(\d+)/.exec(String(init.body))![1])
      return nextcloud(url, init)
    })
    await get('/api/gallery/recent?limit=999')
    vi.stubGlobal('fetch', nextcloud)
    expect(asked).toBe(50)
  })
})

describe('shaping', () => {
  it('strips the upload uuid from names', () => {
    expect(displayName(`${UUID}-beach.jpg`)).toBe('beach.jpg')
    expect(displayName('plain.jpg')).toBe('plain.jpg')
  })

  it('keeps two files with the same name in one folder apart', () => {
    const entries = toEntries([
      { path: `posts/2026-10/${UUID}-a.jpg`, contentType: 'image/jpeg', size: 1, modified: null },
      { path: `posts/2026-10/${UUID.replace('3', '4')}-a.jpg`, contentType: 'image/jpeg', size: 1, modified: null },
    ], new Map())
    expect(entries.filter((e) => e.type === 'file').map((e) => e.id)).toEqual(['/posts/2026-10/a.jpg', '/posts/2026-10/a (2).jpg'])
    expect(entries.every((e) => e.type === 'folder' || e.url === null)).toBe(true)
  })

  it('names the owner folder like the upload route does', () => {
    expect(sanitizeSegment('019f98d6-ff86-767c-bf22-371535752c48')).toBe('019f98d6-ff86-767c-bf22-371535752c48')
    expect(sanitizeSegment('../../etc')).toBe('etc')
    expect(sanitizeSegment('', 'anonymous')).toBe('anonymous')
  })

  it('knows media kinds', () => {
    expect([kindOf('image/webp'), kindOf('VIDEO/MP4'), kindOf('audio/mpeg'), kindOf('application/zip')]).toEqual(['image', 'video', 'audio', 'other'])
  })
})
