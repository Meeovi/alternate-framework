import { beforeEach, describe, expect, it, vi } from 'vitest'

// A stand-in for Pinia's setup store: one instance per test, refs not unwrapped.
let instance: any
vi.mock('#imports', () => ({ defineStore: (_id: string, setup: () => any) => () => (instance ??= setup()) }))

const { useWishlistStore } = await import('../../app/stores/wishlist/useWishlistStore')

type Wishlist = { list: { id: number, slug: string, name: string } | null, items: string[] }
let server: Wishlist & { signedIn: boolean }
const calls: { method: string, body?: any }[] = []

const fetchMock = vi.fn(async (_url: string, options: { method?: string, body?: any } = {}) => {
  const method = options.method ?? 'GET'
  calls.push({ method, body: options.body })
  if (!server.signedIn) throw Object.assign(new Error('401'), { status: 401 })
  if (method === 'POST') {
    server.list ??= { id: 9, slug: 'wishlist-abc', name: 'Wishlist' }
    for (const key of options.body.productKeys) if (!server.items.includes(key)) server.items.push(key)
  }
  if (method === 'DELETE') server.items = server.items.filter((k) => k !== options.body.productKey)
  return { list: server.list, items: [...server.items] }
})

// The tests run in Node: a minimal browser storage.
const memory = new Map<string, string>()
const localStorage = {
  getItem: (k: string) => memory.get(k) ?? null,
  setItem: (k: string, v: string) => { memory.set(k, String(v)) },
  removeItem: (k: string) => { memory.delete(k) },
  clear: () => memory.clear(),
}

beforeEach(() => {
  instance = undefined
  calls.length = 0
  server = { signedIn: true, list: null, items: [] }
  localStorage.clear()
  vi.stubGlobal('window', {})
  vi.stubGlobal('localStorage', localStorage)
  vi.stubGlobal('$fetch', fetchMock)
})

describe('wishlist store', () => {
  it('saves to the wishlist list when signed in (created on the first heart)', async () => {
    const store = useWishlistStore()
    await store.load()
    expect(store.remote.value).toBe(true)
    await store.toggleItem('magento:habit-tracker')
    expect(calls.at(-1)).toEqual({ method: 'POST', body: { productKeys: ['magento:habit-tracker'] } })
    expect(store.hasItem('magento:habit-tracker')).toBe(true)
    expect(store.listSlug.value).toBe('wishlist-abc')
    await store.toggleItem('magento:habit-tracker')
    expect(calls.at(-1)).toEqual({ method: 'DELETE', body: { productKey: 'magento:habit-tracker' } })
    expect(store.itemCount.value).toBe(0)
  })

  it('keeps the wishlist in this browser when signed out', async () => {
    server.signedIn = false
    const store = useWishlistStore()
    await store.load()
    expect(store.remote.value).toBe(false)
    await store.addItem(42)
    expect(JSON.parse(localStorage.getItem('wishlist:items')!)).toEqual(['42'])
    expect(calls.filter((c) => c.method !== 'GET')).toEqual([])
  })

  it('moves products saved while signed out into the list on sign-in', async () => {
    localStorage.setItem('wishlist:items', JSON.stringify(['42', 'magento:kanban']))
    server.items = ['42']
    server.list = { id: 9, slug: 'wishlist-abc', name: 'Wishlist' }
    const store = useWishlistStore()
    await store.load()
    expect(calls.at(-1)).toEqual({ method: 'POST', body: { productKeys: ['magento:kanban'] } })
    expect(store.items.value).toEqual(['42', 'magento:kanban'])
    expect(localStorage.getItem('wishlist:items')).toBeNull()
  })

  it('undoes the heart when the server refuses it', async () => {
    const store = useWishlistStore()
    await store.load()
    fetchMock.mockRejectedValueOnce(new Error('400'))
    await store.addItem('bad')
    expect(store.hasItem('bad')).toBe(false)
  })
})
