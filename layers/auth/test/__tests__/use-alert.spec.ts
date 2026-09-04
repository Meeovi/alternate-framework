import { describe, it, expect, vi, beforeEach } from 'vitest'

// useAlert() is now a thin client for POST /api/notifications/auth — the
// email resolution and Directus notification send happen server-side (the
// static token is server-only). These tests just assert the composable
// shape and that each method posts the right route/body to the endpoint.
const fetchMock = vi.fn().mockResolvedValue({ success: true })

beforeEach(() => {
  fetchMock.mockClear()
  vi.stubGlobal('$fetch', fetchMock)
})

describe('useAlert', () => {
  it('is defined and returns the expected auth notification methods', async () => {
    const { useAlert } = await import('../../app/composables/useAlert')
    const composable = useAlert()

    expect(composable).toBeDefined()
    expect(typeof composable.login).toBe('function')
    expect(typeof composable.passwordReset).toBe('function')
    expect(typeof composable.twoFactorCode).toBe('function')
    expect(typeof composable.passwordChanged).toBe('function')
  })

  it('posts the login notification to /api/notifications/auth', async () => {
    const { useAlert } = await import('../../app/composables/useAlert')
    const composable = useAlert()

    await composable.login({ userId: 'user-123', device: 'MacBook' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/notifications/auth')
    expect(opts.method).toBe('POST')
    expect(opts.body).toMatchObject({
      userId: 'user-123',
      route: 'login',
      input: { userId: 'user-123', device: 'MacBook' },
    })
  })
})
