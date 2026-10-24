import { describe, expect, it, vi } from 'vitest'
import { registerCommerceBackendAdapter } from 'alternate-sdk'

// resolveProductForCart's backend branch only talks to the registered
// commerce backend; the cart DB and Directus modules are stubbed.
vi.mock('#auth/server/utils/drizzle', () => ({ db: {} }))
vi.mock('#auth/server/database/migrations/schema', () => ({ cart: {}, cartItems: {} }))
vi.mock('#auth/server/utils/sessions', () => ({ getAuthSession: vi.fn() }))
vi.mock('../../server/utils/directusClient', () => ({ getDirectusFacade: vi.fn() }))

const { resolveProductForCart } = await import('../../server/utils/cart')
const { getDirectusFacade } = await import('../../server/utils/directusClient')

const products: Record<string, Record<string, unknown>> = {
  'habit-tracker': { sku: 'habit-tracker', name: 'Habit Tracker', price: 4.99, requires_shipping: false, status: 'published' },
  'mug': { sku: 'mug', name: 'Mug', price: 12, requires_shipping: true, status: 'published' },
  'legacy': { sku: 'legacy', name: 'Legacy', price: 3, status: 'published' },
  'gift-50': { sku: 'gift-50', name: 'Gift card', price: 50, requires_shipping: false, status: 'published' },
}
const magentoProducts: Record<string, Record<string, unknown>> = {
  HABIT: { sku: 'HABIT', name: 'Habit Tracker', price: 4.99, requires_shipping: false, status: 'published' },
}
registerCommerceBackendAdapter({
  id: 'magento',
  collections: ['products'],
  isEnabled: () => true,
  request: vi.fn(async ({ key }: { key: string }) => magentoProducts[key] ?? null),
} as any)
registerCommerceBackendAdapter({
  id: 'testshop',
  collections: ['products'],
  isEnabled: () => true,
  request: vi.fn(async ({ key }: { key: string }) => products[key] ?? null),
  giftCardProducts: vi.fn(async () => [{ sku: 'gift-50' }]),
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

describe('resolveProductForCart: Directus rows mirrored from Mage-OS', () => {
  const directusRows: Record<string, Record<string, unknown>> = {
    '7': { id: 7, name: 'Habit Tracker (copy)', price: '1.00', source: 'magento', mageos_sku: 'HABIT' },
    '8': { id: 8, name: 'Dropped', price: '1.00', source: 'magento', mageos_sku: 'GONE' },
    '9': { id: 9, name: 'Poster', price: '15.00', source: null, mageos_sku: null },
  }
  vi.mocked(getDirectusFacade).mockReturnValue({
    request: vi.fn(async (command: () => { path: string }) => directusRows[command().path.split('/').pop()!.split('?')[0]!] ?? null),
  } as any)

  it('are sold by the store, at its price', async () => {
    expect(await resolveProductForCart('7')).toMatchObject({ id: 'magento:HABIT', backend: 'magento', price: 4.99, directusId: null })
  })

  it('are refused when the store no longer sells them, never sold at the copy\'s price', async () => {
    expect(await resolveProductForCart('8')).toBeNull()
  })

  it('leave Directus-native products alone', async () => {
    expect(await resolveProductForCart('9')).toMatchObject({ id: '9', backend: null, price: 15, directusId: 9 })
  })
})

describe('resolveProductForCart: gift cards', () => {
  it("are refused: this checkout can't collect the card's recipient", async () => {
    await expect(resolveProductForCart('testshop:gift-50')).rejects.toMatchObject({ statusCode: 409 })
  })

  it('leave the backend\'s other products alone', async () => {
    expect(await resolveProductForCart('testshop:mug')).toMatchObject({ id: 'testshop:mug' })
  })
})
