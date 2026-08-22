import { describe, it, expect, vi, beforeEach } from 'vitest'

const fetchMock = vi.fn().mockResolvedValue({ success: true })

beforeEach(() => {
  fetchMock.mockClear()
  vi.stubGlobal('$fetch', fetchMock)
})

describe('useNotifications', () => {
  it('is defined and returns the expected commerce notification methods', async () => {
    const { useNotifications } = await import('../../app/composables/useNotifications')
    const composable = useNotifications()

    expect(composable).toBeDefined()
    expect(typeof composable.cartItemAdded).toBe('function')
    expect(typeof composable.orderConfirmed).toBe('function')
    expect(typeof composable.orderShipped).toBe('function')
    expect(typeof composable.paymentSucceeded).toBe('function')
    expect(typeof composable.paymentFailed).toBe('function')
    expect(typeof composable.checkoutCompleted).toBe('function')
  })

  it('posts to /api/notifications/commerce with the route name and input', async () => {
    const { useNotifications } = await import('../../app/composables/useNotifications')
    const composable = useNotifications()

    await composable.cartItemAdded({
      userId: 'user-123',
      productName: 'Wireless Headphones',
      productId: 'prod-1',
      quantity: 1,
      cartUrl: 'https://example.com/cart',
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/notifications/commerce', {
      method: 'POST',
      body: expect.objectContaining({ userId: 'user-123', route: 'cartItemAdded' }),
    })
  })
})
