import { beforeEach, describe, expect, test, vi } from 'vitest'

// Nitro auto-imports used by server/utils/pixanomy.ts.
const runtimeConfig = {
  pixanomy: { url: 'https://app.pixanomy.test/', username: 'svc', appPassword: 'app-pass', root: 'Meeovi' },
}
vi.stubGlobal('useRuntimeConfig', () => runtimeConfig)
vi.stubGlobal('createError', (opts: { statusCode: number, statusMessage: string }) =>
  Object.assign(new Error(opts.statusMessage), opts))

const { uploadToPixanomy, listPixanomyAssets, sanitizeSegment, decodeDataUrl, isAllowedAssetType } = await import('../../server/utils/pixanomy')

describe('pixanomy upload', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  test('creates folders, PUTs the file and returns the public download link', async () => {
    fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
      if (init.method === 'MKCOL') return new Response(null, { status: 405 })
      if (init.method === 'PUT') return new Response(null, { status: 201, headers: { 'OC-FileId': '42' } })
      return new Response(JSON.stringify({ ocs: { data: { url: 'https://app.pixanomy.test/s/AbC123' } } }), { status: 200 })
    })

    const asset = await uploadToPixanomy({
      data: new Uint8Array([1, 2, 3]),
      filename: '../../My Photo.JPG',
      contentType: 'image/jpeg',
      ownerId: 'user-1',
      category: 'posts',
    })

    expect(asset.url).toBe('https://app.pixanomy.test/s/AbC123/download')
    expect(asset.fileId).toBe('42')
    expect(asset.size).toBe(3)
    expect(asset.path).toMatch(/^\/Meeovi\/user-1\/posts\/\d{4}-\d{2}\/[0-9a-f-]{36}-My-Photo.JPG$/)

    const put = fetchMock.mock.calls.find(([, init]) => init.method === 'PUT')!
    expect(put[0]).toContain('https://app.pixanomy.test/remote.php/dav/files/svc/Meeovi/user-1/posts/')
    expect(put[1].headers.Authorization).toBe('Basic ' + Buffer.from('svc:app-pass').toString('base64'))

    const share = fetchMock.mock.calls.at(-1)!
    expect(share[0]).toContain('/ocs/v2.php/apps/files_sharing/api/v1/shares')
    expect(String(share[1].body)).toContain('shareType=3')
    expect(String(share[1].body)).toContain('permissions=1')
  })

  test('surfaces a failed PUT as a 502', async () => {
    fetchMock.mockImplementation(async (_: string, init: RequestInit) =>
      new Response(null, { status: init.method === 'MKCOL' ? 201 : 507 }))
    await expect(uploadToPixanomy({
      data: new Uint8Array([1]), filename: 'a.png', contentType: 'image/png', ownerId: 'u',
    })).rejects.toMatchObject({ statusCode: 502 })
  })

  test('refuses to run when credentials are missing', async () => {
    const saved = runtimeConfig.pixanomy.appPassword
    runtimeConfig.pixanomy.appPassword = ''
    await expect(uploadToPixanomy({
      data: new Uint8Array([1]), filename: 'a.png', contentType: 'image/png', ownerId: 'u',
    })).rejects.toMatchObject({ statusCode: 503 })
    runtimeConfig.pixanomy.appPassword = saved
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('pixanomy helpers', () => {
  test('sanitizeSegment strips traversal and odd characters', () => {
    expect(sanitizeSegment('../../etc/passwd')).toBe('etc-passwd')
    expect(sanitizeSegment('...')).toBe('file')
  })

  test('decodeDataUrl', () => {
    const decoded = decodeDataUrl('data:image/png;base64,AQID')
    expect(decoded?.contentType).toBe('image/png')
    expect(Array.from(decoded!.data)).toEqual([1, 2, 3])
    expect(decodeDataUrl('https://example.com/a.png')).toBeNull()
  })

  test('isAllowedAssetType blocks active content', () => {
    expect(isAllowedAssetType('image/jpeg')).toBe(true)
    expect(isAllowedAssetType('video/mp4')).toBe(true)
    expect(isAllowedAssetType('image/svg+xml')).toBe(false)
    expect(isAllowedAssetType('text/html')).toBe(false)
  })
})

describe('pixanomy listing', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  const davResponse = (href: string, type: string, id: string) => `<d:response><d:href>${href}</d:href><d:propstat><d:prop>
    <d:getcontenttype>${type}</d:getcontenttype><d:getlastmodified>Fri, 25 Sep 2026 10:00:00 GMT</d:getlastmodified>
    <d:getcontentlength>2048</d:getcontentlength><oc:fileid>${id}</oc:fileid></d:prop></d:propstat></d:response>`

  test('searches only inside the owner folder and reuses each file\'s public link', async () => {
    fetchMock.mockImplementation(async (url: string, init: RequestInit = {}) => {
      if (init.method === 'SEARCH') {
        return new Response(`<?xml version="1.0"?><d:multistatus xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
          ${davResponse('/remote.php/dav/files/svc/Meeovi/user-1/posts/2026-09/0f8fad5b-d9cb-469f-a165-70867728950e-beach.jpg', 'image/jpeg', '7')}
          ${davResponse('/remote.php/dav/files/svc/Meeovi/user-1/vibez/2026-09/7c9e6679-7425-40de-944b-e07fc1f90ae7-clip.mp4', 'video/mp4', '8')}
        </d:multistatus>`, { status: 207 })
      }
      const path = new URL(url).searchParams.get('path')
      const token = path?.endsWith('.mp4') ? 'Vid' : 'Img'
      return new Response(JSON.stringify({ ocs: { data: [{ share_type: 3, url: `https://app.pixanomy.test/s/${token}` }] } }), { status: 200 })
    })

    const assets = await listPixanomyAssets('user-1', { limit: 5 })

    const search = fetchMock.mock.calls.find(([, init]) => init?.method === 'SEARCH')!
    expect(search[1].body).toContain('<d:href>/files/svc/Meeovi/user-1</d:href>')
    expect(search[1].body).toContain('<d:nresults>5</d:nresults>')
    expect(assets).toEqual([
      expect.objectContaining({ filename: 'beach.jpg', contentType: 'image/jpeg', fileId: '7', category: 'posts', size: 2048, url: 'https://app.pixanomy.test/s/Img/download' }),
      expect.objectContaining({ filename: 'clip.mp4', contentType: 'video/mp4', category: 'vibez', url: 'https://app.pixanomy.test/s/Vid/download' }),
    ])
  })

  test('owner id cannot escape its folder', async () => {
    fetchMock.mockResolvedValue(new Response('<d:multistatus xmlns:d="DAV:"></d:multistatus>', { status: 207 }))
    await listPixanomyAssets('../other-user')
    expect(fetchMock.mock.calls[0]![1].body).toContain('<d:href>/files/svc/Meeovi/other-user</d:href>')
  })

  test('an owner with no uploads yet (404 scope) is an empty list', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }))
    await expect(listPixanomyAssets('new-user')).resolves.toEqual([])
  })
})
