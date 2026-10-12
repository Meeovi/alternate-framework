import { beforeEach, describe, expect, it, vi } from 'vitest'

// Session + Directus are mocked: no login or CMS writes in tests.
const state = vi.hoisted(() => ({
  user: { id: 'viewer-1' } as { id: string } | null,
  items: {} as Record<string, Record<string, any>>,
  updates: [] as Array<{ collection: string, id: string, data: any }>,
}))

vi.mock('#auth/server/utils/sessions', () => ({
  requireAuth: async () => {
    if (!state.user) throw Object.assign(new Error('Unauthorized'), { statusCode: 401 })
    return state.user
  },
}))

vi.mock('@directus/sdk', () => {
  const client: any = {
    with: () => client,
    request: async (op: any) => op(),
  }
  return {
    createDirectus: () => client,
    rest: () => ({}),
    staticToken: () => ({}),
    readItem: (collection: string, id: string) => async () => {
      const item = state.items[`${collection}:${id}`]
      if (!item) throw new Error('not found')
      return { ...item }
    },
    updateItem: (collection: string, id: string, data: any) => async () => {
      state.updates.push({ collection, id, data })
      Object.assign(state.items[`${collection}:${id}`]!, data)
      return {}
    },
  }
})

const { default: handler } = await import('../../server/api/social/views/[type]/[id].post')

const view = (type: string, id: string) => (handler as any)({ context: { params: { type, id } }, node: { req: { headers: {} } } })

describe('POST /api/social/views/:type/:id', () => {
  beforeEach(() => {
    state.user = { id: 'viewer-1' }
    state.updates = []
    state.items = {
      'posts:20': { id: 20, views: 7, creator_id: 'author-1' },
      'shorts:46': { id: 46, views: null, creator_id: 'author-2' },
    }
  })

  it('counts a first view and returns the new total', async () => {
    expect(await view('post', '20')).toEqual({ views: 8, counted: true })
    expect(state.updates).toEqual([{ collection: 'posts', id: '20', data: { views: 8 } }])
  })

  it('counts the same person once per day', async () => {
    state.items['posts:20']!.views = 0
    state.user = { id: 'repeat-viewer' }
    await view('post', '20')
    expect(await view('post', '20')).toEqual({ views: 1, counted: false })
    expect(state.updates).toHaveLength(1)
  })

  it("doesn't count a creator viewing their own item", async () => {
    state.user = { id: 'author-1' }
    expect(await view('post', '20')).toEqual({ views: 7, counted: false })
    expect(state.updates).toHaveLength(0)
  })

  it('counts vibes, starting from no views', async () => {
    expect(await view('shorts', '46')).toEqual({ views: 1, counted: true })
  })

  it('requires a session and rejects bad input', async () => {
    state.user = null
    await expect(view('post', '20')).rejects.toMatchObject({ statusCode: 401 })
    state.user = { id: 'viewer-9' }
    await expect(view('product', '20')).rejects.toMatchObject({ statusCode: 404 })
    await expect(view('post', '../x')).rejects.toMatchObject({ statusCode: 400 })
    await expect(view('post', '999')).rejects.toMatchObject({ statusCode: 404 })
  })
})
