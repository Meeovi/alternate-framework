import { beforeEach, describe, expect, test, vi } from 'vitest'

// Nitro auto-imports used by server/utils/pixanomy.ts.
const runtimeConfig = {
  pixanomy: { url: 'https://app.pixanomy.test/', username: 'svc', appPassword: 'app-pass', root: 'Meeovi' },
}
vi.stubGlobal('useRuntimeConfig', () => runtimeConfig)
vi.stubGlobal('createError', (opts: { statusCode: number, statusMessage: string }) =>
  Object.assign(new Error(opts.statusMessage), opts))

const { uploadToPixanomy, sanitizeSegment, decodeDataUrl, isAllowedAssetType } = await import('../../server/utils/pixanomy')

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
