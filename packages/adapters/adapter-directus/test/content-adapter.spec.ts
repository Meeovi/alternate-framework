import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  requestMock,
  connectMock,
  disconnectMock,
  subscribeMock,
  withMock,
} = vi.hoisted(() => {
  const withMock = vi.fn()
  return {
    requestMock: vi.fn(),
    connectMock: vi.fn().mockResolvedValue(undefined),
    disconnectMock: vi.fn(),
    subscribeMock: vi.fn(),
    withMock,
  }
})

vi.mock('@directus/sdk', () => {
  // createDirectus(url).with(x).with(y) — a fluent builder that always
  // returns the same client object, matching the real SDK's chaining.
  const client: any = {
    request: requestMock,
    connect: connectMock,
    disconnect: disconnectMock,
    subscribe: subscribeMock,
  }
  client.with = withMock.mockReturnValue(client)

  return {
    createDirectus: vi.fn(() => client),
    rest: vi.fn(() => 'rest'),
    realtime: vi.fn(() => 'realtime'),
    authentication: vi.fn(() => 'authentication'),
    staticToken: vi.fn((token: string) => ({ __staticToken: token })),
    readItems: vi.fn((collection: string, opts: any) => ({ __op: 'readItems', collection, opts })),
    createItem: vi.fn((collection: string, payload: any) => ({ __op: 'createItem', collection, payload })),
    readFieldsByCollection: vi.fn((collection: string) => ({ __op: 'readFieldsByCollection', collection })),
    uploadFiles: vi.fn((formData: any) => ({ __op: 'uploadFiles', formData })),
  }
})

import { createDirectusContentAdapter } from '../src/runtime/content-adapter'

describe('createDirectusContentAdapter', () => {
  const adapter = createDirectusContentAdapter('https://cms.example.com', 'secret-token')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has id "directus"', () => {
    expect(adapter.id).toBe('directus')
  })

  it('listMedia reads the "media" collection sorted by -date_created by default', async () => {
    requestMock.mockResolvedValue([{ id: '1' }])

    const result = await adapter.listMedia()

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({ __op: 'readItems', collection: 'media', opts: { sort: ['-date_created'] } }),
    )
    expect(result).toEqual([{ id: '1' }])
  })

  it('listMedia honors a custom sort param', async () => {
    requestMock.mockResolvedValue([])
    await adapter.listMedia({ sort: ['title'] })

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({ opts: { sort: ['title'] } }),
    )
  })

  it('listMedia normalizes a non-array response to an empty array', async () => {
    requestMock.mockResolvedValue(null)
    const result = await adapter.listMedia()
    expect(result).toEqual([])
  })

  it('listMediaFolders reads "media_folders" sorted by sort, name', async () => {
    requestMock.mockResolvedValue([{ id: 'f1', name: 'Vacation' }])

    const result = await adapter.listMediaFolders()

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'media_folders', opts: { sort: ['sort', 'name'] } }),
    )
    expect(result).toEqual([{ id: 'f1', name: 'Vacation' }])
  })

  it('uploadMedia passes the FormData straight through to uploadFiles', async () => {
    const formData = new FormData()
    requestMock.mockResolvedValue({ id: 'file1' })

    const result = await adapter.uploadMedia(formData)

    expect(requestMock).toHaveBeenCalledWith(expect.objectContaining({ __op: 'uploadFiles', formData }))
    expect(result).toEqual({ id: 'file1' })
  })

  it('createMediaFolder creates an item in "media_folders" with the given payload', async () => {
    requestMock.mockResolvedValue({ id: 'f2', name: 'New Folder' })

    const result = await adapter.createMediaFolder({ name: 'New Folder' })

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({ __op: 'createItem', collection: 'media_folders', payload: { name: 'New Folder' } }),
    )
    expect(result).toEqual({ id: 'f2', name: 'New Folder' })
  })

  it('getCollectionSchema reads fields for the given collection', async () => {
    requestMock.mockResolvedValue([{ field: 'title', type: 'string' }])

    const result = await adapter.getCollectionSchema('posts')

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({ __op: 'readFieldsByCollection', collection: 'posts' }),
    )
    expect(result).toEqual([{ field: 'title', type: 'string' }])
  })

  it('getCollectionSchema normalizes a non-array response to an empty array', async () => {
    requestMock.mockResolvedValue(undefined)
    const result = await adapter.getCollectionSchema('posts')
    expect(result).toEqual([])
  })

  describe('subscribeToCollection', () => {
    it('connects a dedicated realtime client and subscribes with the given filter', async () => {
      async function* emptyGenerator() {}
      subscribeMock.mockResolvedValue({ subscription: emptyGenerator(), unsubscribe: vi.fn() })

      await adapter.subscribeToCollection!('posts', { user_created: { _eq: 'u1' } }, vi.fn())
      // connect() resolution and the subscribe() call both happen inside a
      // detached async chain (not awaited by subscribeToCollection itself,
      // matching the original pre-rewrite behavior) — flush microtasks.
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(connectMock).toHaveBeenCalled()
      expect(subscribeMock).toHaveBeenCalledWith('posts', {
        event: 'update',
        query: { fields: ['*'], filter: { user_created: { _eq: 'u1' } } },
      })
    })

    it('forwards update/create/delete events to onEvent, normalizing data to an array', async () => {
      async function* messages() {
        yield { event: 'update', data: [{ id: '1', title: 'Changed' }] }
      }
      subscribeMock.mockResolvedValue({ subscription: messages(), unsubscribe: vi.fn() })

      const onEvent = vi.fn()
      await adapter.subscribeToCollection!('posts', {}, onEvent)
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(onEvent).toHaveBeenCalledWith({
        event: 'update',
        collection: 'posts',
        data: [{ id: '1', title: 'Changed' }],
      })
    })

    it('treats the initial "init" snapshot the same as an update event', async () => {
      async function* messages() {
        yield { event: 'init', data: [{ id: '1' }] }
      }
      subscribeMock.mockResolvedValue({ subscription: messages(), unsubscribe: vi.fn() })

      const onEvent = vi.fn()
      await adapter.subscribeToCollection!('posts', {}, onEvent)
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ event: 'update' }))
    })

    it('logs and skips an "error" event without calling onEvent or crashing', async () => {
      async function* messages() {
        yield { event: 'error', error: { code: 'TOKEN_EXPIRED', message: 'expired' } }
      }
      subscribeMock.mockResolvedValue({ subscription: messages(), unsubscribe: vi.fn() })
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const onEvent = vi.fn()
      await adapter.subscribeToCollection!('posts', {}, onEvent)
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(onEvent).not.toHaveBeenCalled()
      expect(errorSpy).toHaveBeenCalled()
      errorSpy.mockRestore()
    })

    it('the returned unsubscribe function calls the SDK unsubscribe and disconnects the realtime client', async () => {
      async function* neverEnds() {
        // eslint-disable-next-line no-constant-condition
        while (true) await new Promise(() => {})
      }
      const sdkUnsubscribe = vi.fn()
      subscribeMock.mockResolvedValue({ subscription: neverEnds(), unsubscribe: sdkUnsubscribe })

      const unsubscribe = await adapter.subscribeToCollection!('posts', {}, vi.fn())
      await new Promise((resolve) => setTimeout(resolve, 0))
      unsubscribe()

      expect(sdkUnsubscribe).toHaveBeenCalled()
      expect(disconnectMock).toHaveBeenCalled()
    })
  })
})
