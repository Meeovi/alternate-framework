import { beforeEach, vi } from 'vitest'
import { __resetNuxtState } from './mocks/nuxt-app'

vi.mock('~/composables/useCart/registry', () => ({
  getCartProvider: () => ({
    getCart: async () => ({ id: 'cart-1', items: [], total: 0 }),
    addItem: async () => ({ id: 'cart-1', items: [], total: 0 }),
    removeItem: async () => ({ id: 'cart-1', items: [], total: 0 }),
    clearCart: async () => ({ id: 'cart-1', items: [], total: 0 }),
  }),
  registerCartProvider: vi.fn(),
  registerCartProviderRuntime: vi.fn(),
}))

beforeEach(() => {
  __resetNuxtState()
})
