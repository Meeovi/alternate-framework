import { describe, expect, it, vi } from 'vitest'
import { registerCommerceBackendAdapter } from 'alternate-sdk'
import { giftCardsFor, maskCode } from '../../server/utils/giftCards'

const card = (over: Record<string, unknown>) => ({
  code: null, state: 'available', enabled: true, balance: 25, created_at: '2026-10-01 10:00:00', expires_at: null,
  recipient_name: null, recipient_email: null, sender_name: null, sender_email: null,
  product_name: 'Gift Card', product_sku: 'gc', order_number: '000000009', message: null, ...over,
})

const receivedGiftCards = vi.fn(async (_email: string) => [card({ code: 'RECEIVED1234' })])
const purchasedGiftCards = vi.fn(async (_customerId: string) => [
  card({ code: 'FORFRIEND9876', recipient_email: 'friend@example.com', created_at: '2026-10-02 10:00:00' }),
  card({ code: 'FORME5555', recipient_email: 'ME@example.com' }),
  card({ code: 'NORECIPIENT1111', created_at: '2026-09-01 10:00:00' }),
])

registerCommerceBackendAdapter({
  id: 'magento', collections: [], isEnabled: () => true, request: vi.fn(), receivedGiftCards, purchasedGiftCards,
} as any)

const me = { id: 'u1', email: 'me@example.com', emailVerified: true, magentoCustomerId: 42 }

describe('gift cards ("wishes")', () => {
  it('reads received cards by the verified email and bought cards by the linked customer', async () => {
    const { received, purchased } = await giftCardsFor(me)
    expect(receivedGiftCards).toHaveBeenLastCalledWith('me@example.com')
    expect(purchasedGiftCards).toHaveBeenLastCalledWith('42')
    expect(received).toEqual([expect.objectContaining({ code: 'RECEIVED1234', source: 'magento' })])
    expect(purchased.map((c) => c.masked_code)).toEqual(['•••••••••9876', '•••••5555', '•••••••••••1111'])
  })

  it('hides the code of a card bought for someone else', async () => {
    const { purchased } = await giftCardsFor(me)
    expect(purchased.map((c) => c.code)).toEqual([null, 'FORME5555', 'NORECIPIENT1111'])
  })

  it('skips received cards without a verified email, and bought cards without a linked customer', async () => {
    receivedGiftCards.mockClear()
    purchasedGiftCards.mockClear()
    const { received, purchased } = await giftCardsFor({ id: 'u2', email: 'x@example.com', emailVerified: false })
    expect(received).toEqual([])
    expect(purchased).toEqual([])
    expect(receivedGiftCards).not.toHaveBeenCalled()
    expect(purchasedGiftCards).not.toHaveBeenCalled()
  })

  it('masks all but the last 4 characters', () => {
    expect(maskCode('ABCDEFGH')).toBe('••••EFGH')
    expect(maskCode('ABC')).toBe('••••ABC')
    expect(maskCode(null)).toBeNull()
  })
})
