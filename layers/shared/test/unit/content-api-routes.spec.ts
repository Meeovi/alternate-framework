import { describe, it, expect, vi, beforeEach } from 'vitest'

const { getDefaultAdapter, requireAuth } = vi.hoisted(() => ({
  getDefaultAdapter: vi.fn(),
  requireAuth: vi.fn(),
}))

vi.mock('alternate-sdk', () => ({
  ContentAdapterRegistry: { getDefaultAdapter },
}))

// The write routes (media.post, media-folders.post) gate on an authenticated
// session before touching the adapter.
vi.mock('#auth/server/utils/sessions', () => ({ requireAuth }))

// h3's real defineEventHandler/createError wrap Nitro-specific request
// machinery this suite doesn't have — these routes only need the identity
// behavior (call the handler directly) and a way to build a recognizable
// error, so h3 itself is mocked rather than partially faked.
vi.mock('h3', () => ({
  defineEventHandler: (fn: (event: any) => any) => fn,
  createError: (opts: { statusCode: number, statusMessage: string }) => Object.assign(new Error(opts.statusMessage), opts),
  getQuery: vi.fn((event: any) => event.__query ?? {}),
  readBody: vi.fn((event: any) => Promise.resolve(event.__body)),
  readFormData: vi.fn((event: any) => Promise.resolve(event.__formData)),
  getRouterParam: vi.fn((event: any, name: string) => event.__params?.[name]),
  createEventStream: vi.fn((event: any) => event.__stream),
}))

import mediaGet from '../../server/api/content/media.get'
import mediaPost from '../../server/api/content/media.post'
import mediaFoldersGet from '../../server/api/content/media-folders.get'
import mediaFoldersPost from '../../server/api/content/media-folders.post'
import schemaGet from '../../server/api/content/schema/[collection].get'
import subscribeGet from '../../server/api/content/subscribe.get'

describe('server/api/content/* routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('media.get', () => {
    it('returns 501 when no content backend is registered', async () => {
      getDefaultAdapter.mockReturnValue(undefined)
      await expect(mediaGet({} as any)).rejects.toMatchObject({ statusCode: 501 })
    })

    it('calls adapter.listMedia with sort parsed from the query string', async () => {
      const listMedia = vi.fn().mockResolvedValue([{ id: '1' }])
      getDefaultAdapter.mockReturnValue({ listMedia })

      const result = await mediaGet({ __query: { sort: '-date_created,title' } } as any)

      expect(listMedia).toHaveBeenCalledWith({ sort: ['-date_created', 'title'] })
      expect(result).toEqual([{ id: '1' }])
    })

    it('passes sort: undefined when no sort query param is given', async () => {
      const listMedia = vi.fn().mockResolvedValue([])
      getDefaultAdapter.mockReturnValue({ listMedia })

      await mediaGet({ __query: {} } as any)

      expect(listMedia).toHaveBeenCalledWith({ sort: undefined })
    })
  })

  describe('media.post', () => {
    it('rejects an unauthenticated request before touching the adapter', async () => {
      requireAuth.mockRejectedValueOnce(Object.assign(new Error('Unauthorized'), { statusCode: 401 }))
      await expect(mediaPost({} as any)).rejects.toMatchObject({ statusCode: 401 })
      expect(getDefaultAdapter).not.toHaveBeenCalled()
    })

    it('returns 501 when no content backend is registered', async () => {
      getDefaultAdapter.mockReturnValue(undefined)
      await expect(mediaPost({} as any)).rejects.toMatchObject({ statusCode: 501 })
    })

    it('forwards the parsed FormData to adapter.uploadMedia', async () => {
      const formData = new FormData()
      const uploadMedia = vi.fn().mockResolvedValue({ id: 'f1' })
      getDefaultAdapter.mockReturnValue({ uploadMedia })

      const result = await mediaPost({ __formData: formData } as any)

      expect(uploadMedia).toHaveBeenCalledWith(formData)
      expect(result).toEqual({ id: 'f1' })
    })
  })

  describe('media-folders.get', () => {
    it('returns 501 when no content backend is registered', async () => {
      getDefaultAdapter.mockReturnValue(undefined)
      await expect(mediaFoldersGet({} as any)).rejects.toMatchObject({ statusCode: 501 })
    })

    it('returns adapter.listMediaFolders() as-is', async () => {
      const listMediaFolders = vi.fn().mockResolvedValue([{ id: 'f1', name: 'Vacation' }])
      getDefaultAdapter.mockReturnValue({ listMediaFolders })

      const result = await mediaFoldersGet({} as any)

      expect(result).toEqual([{ id: 'f1', name: 'Vacation' }])
    })
  })

  describe('media-folders.post', () => {
    it('rejects an unauthenticated request before touching the adapter', async () => {
      requireAuth.mockRejectedValueOnce(Object.assign(new Error('Unauthorized'), { statusCode: 401 }))
      await expect(mediaFoldersPost({} as any)).rejects.toMatchObject({ statusCode: 401 })
      expect(getDefaultAdapter).not.toHaveBeenCalled()
    })

    it('returns 501 when no content backend is registered', async () => {
      getDefaultAdapter.mockReturnValue(undefined)
      await expect(mediaFoldersPost({} as any)).rejects.toMatchObject({ statusCode: 501 })
    })

    it('wraps a plain string body into { name: string } before calling createMediaFolder', async () => {
      const createMediaFolder = vi.fn().mockResolvedValue({ id: 'f2', name: 'New Folder' })
      getDefaultAdapter.mockReturnValue({ createMediaFolder })

      await mediaFoldersPost({ __body: 'New Folder' } as any)

      expect(createMediaFolder).toHaveBeenCalledWith({ name: 'New Folder' })
    })

    it('passes an object body straight through', async () => {
      const createMediaFolder = vi.fn().mockResolvedValue({ id: 'f3' })
      getDefaultAdapter.mockReturnValue({ createMediaFolder })

      await mediaFoldersPost({ __body: { name: 'New Folder', parent: 'f1' } } as any)

      expect(createMediaFolder).toHaveBeenCalledWith({ name: 'New Folder', parent: 'f1' })
    })
  })

  describe('schema/[collection].get', () => {
    it('returns 501 when no content backend is registered', async () => {
      getDefaultAdapter.mockReturnValue(undefined)
      await expect(schemaGet({ __params: { collection: 'posts' } } as any)).rejects.toMatchObject({ statusCode: 501 })
    })

    it('returns 400 when the collection route param is missing', async () => {
      getDefaultAdapter.mockReturnValue({ getCollectionSchema: vi.fn() })
      await expect(schemaGet({ __params: {} } as any)).rejects.toMatchObject({ statusCode: 400 })
    })

    it('calls adapter.getCollectionSchema with the route param', async () => {
      const getCollectionSchema = vi.fn().mockResolvedValue([{ field: 'title' }])
      getDefaultAdapter.mockReturnValue({ getCollectionSchema })

      const result = await schemaGet({ __params: { collection: 'posts' } } as any)

      expect(getCollectionSchema).toHaveBeenCalledWith('posts')
      expect(result).toEqual([{ field: 'title' }])
    })
  })

  describe('subscribe.get', () => {
    it('returns 501 when the active adapter has no subscribeToCollection support', async () => {
      getDefaultAdapter.mockReturnValue({})
      await expect(subscribeGet({ __query: { collection: 'posts' } } as any)).rejects.toMatchObject({ statusCode: 501 })
    })

    it('returns 400 when the collection query param is missing', async () => {
      getDefaultAdapter.mockReturnValue({ subscribeToCollection: vi.fn() })
      await expect(subscribeGet({ __query: {} } as any)).rejects.toMatchObject({ statusCode: 400 })
    })

    it('subscribes with a userField/_eq filter built from the query params, and streams events as JSON', async () => {
      let onEvent: (change: unknown) => void = () => {}
      const unsubscribe = vi.fn()
      const subscribeToCollection = vi.fn((_collection, _filter, cb) => {
        onEvent = cb
        return Promise.resolve(unsubscribe)
      })
      getDefaultAdapter.mockReturnValue({ subscribeToCollection })

      const pushed: string[] = []
      let closedHandler: () => void = () => {}
      const stream = {
        push: (data: string) => pushed.push(data),
        onClosed: (cb: () => void) => { closedHandler = cb },
        send: vi.fn().mockResolvedValue('sent'),
      }

      const result = await subscribeGet({
        __query: { collection: 'posts', userField: 'author', userId: 'u1' },
        __stream: stream,
      } as any)

      expect(subscribeToCollection).toHaveBeenCalledWith('posts', { author: { _eq: 'u1' } }, expect.any(Function))
      expect(result).toBe('sent')

      onEvent({ event: 'update', collection: 'posts', data: [{ id: '1' }] })
      expect(pushed).toEqual([JSON.stringify({ event: 'update', collection: 'posts', data: [{ id: '1' }] })])

      closedHandler()
      expect(unsubscribe).toHaveBeenCalled()
    })

    it('subscribes with an empty filter when no userId is given', async () => {
      const subscribeToCollection = vi.fn().mockResolvedValue(vi.fn())
      getDefaultAdapter.mockReturnValue({ subscribeToCollection })
      const stream = { push: vi.fn(), onClosed: vi.fn(), send: vi.fn().mockResolvedValue('sent') }

      await subscribeGet({ __query: { collection: 'posts' }, __stream: stream } as any)

      expect(subscribeToCollection).toHaveBeenCalledWith('posts', {}, expect.any(Function))
    })
  })
})
