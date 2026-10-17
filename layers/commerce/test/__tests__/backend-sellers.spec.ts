import { describe, expect, it, vi } from 'vitest'
import { registerCommerceBackendAdapter } from 'alternate-sdk'

const members: Record<number, { name: string, username: string | null }> = { 97: { name: 'Max Doe', username: 'maxdoe' } }
let lastCustomerId: number | null = null
vi.mock('drizzle-orm', () => ({ and: vi.fn(), or: vi.fn(), isNull: vi.fn(), eq: vi.fn((_col: unknown, value: unknown) => { if (typeof value === 'number') lastCustomerId = value }) }))
vi.mock('#auth/server/database/migrations/schema', () => ({ users: { magentoCustomerId: 'magento_customer_id' } }))
vi.mock('#auth/server/utils/drizzle', () => ({
  db: { select: () => ({ from: () => ({ where: () => ({ limit: async () => (lastCustomerId && members[lastCustomerId] ? [members[lastCustomerId]] : []) }) }) }) },
}))

const { productSeller } = await import('../../server/utils/backendSellers')

registerCommerceBackendAdapter({
  id: 'magento',
  collections: ['products'],
  isEnabled: () => true,
  request: vi.fn(),
  productSellers: vi.fn(async (keys: string[]) => Object.fromEntries(keys.flatMap((k) => (
    k === 'titled' ? [[k, { customerId: '97', name: 'Max Shop' }]]
      : k === 'untitled' ? [[k, { customerId: '97', name: null }]]
        : k === 'stranger' ? [[k, { customerId: '5', name: null }]] : [])))),
} as any)

describe('productSeller', () => {
  it('uses the shop name when the seller set one', async () => {
    expect(await productSeller('magento:titled')).toEqual({ name: 'Max Shop', username: 'maxdoe' })
  })

  it('falls back to the linked member\'s name', async () => {
    expect(await productSeller('magento:untitled')).toEqual({ name: 'Max Doe', username: 'maxdoe' })
  })

  it('is null with no seller, no name, or a Directus product', async () => {
    expect(await productSeller('magento:unsold')).toBeNull()
    expect(await productSeller('magento:stranger')).toBeNull()
    expect(await productSeller('123')).toBeNull()
  })
})
