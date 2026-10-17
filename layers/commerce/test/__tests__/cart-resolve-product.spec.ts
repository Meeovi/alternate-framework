import { describe, expect, it, vi } from 'vitest'
import { registerCommerceBackendAdapter } from 'alternate-sdk'

// resolveProductForCart's backend branch only talks to the registered
// commerce backend; the cart DB and Directus modules are stubbed.
vi.mock('#auth/server/utils/drizzle', () => ({ db: {} }))
vi.mock('#auth/server/database/migrations/schema', () => ({ cart: {}, cartItems: {} }))
vi.mock('#auth/server/utils/sessions', () => ({ getAuthSession: vi.fn() }))
vi.mock('../../server/utils/directusClient', () => ({ getDirectusFacade: vi.fn() }))

const { resolveProductForCart } = await import('../../server/utils/cart')

const products: Record<string, Record<string, unknown>> = {
  'habit-tracker': { sku: 'habit-tracker', name: 'Habit Tracker', price: 4.99, requires_shipping: false, status: 'published' },
  'mug': { sku: 'mug', name: 'Mug', price: 12, requires_shipping: true, status: 'published' },
  'legacy': { sku: 'legacy', name: 'Legacy', price: 3, status: 'published' },
}
registerCommerceBackendAdapter({
  id: 'testshop',
  collections: ['products'],
  isEnabled: () => true,
  request: vi.fn(async ({ key }: { key: string }) => products[key] ?? null),
} as any)

describe('resolveProductForCart: requiresShipping', () => {
  it('is false for a backend product that never ships (virtual/downloadable)', async () => {
    expect(await resolveProductForCart('testshop:habit-tracker')).toMatchObject({ id: 'testshop:habit-tracker', price: 4.99, requiresShipping: false })
  })

  it('is true for a shippable product, and for one that doesn\'t say', async () => {
    expect((await resolveProductForCart('testshop:mug'))?.requiresShipping).toBe(true)
    expect((await resolveProductForCart('testshop:legacy'))?.requiresShipping).toBe(true)
  })
})
