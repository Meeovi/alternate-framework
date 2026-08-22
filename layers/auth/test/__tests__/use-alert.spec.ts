import { describe, it, expect, vi, beforeEach } from 'vitest'

// useAlert() resolves the target user's email via $directus before doing
// any real notification work — returning no user short-circuits before the
// betternotify/Directus-transport machinery is touched, so that's all this
// needs to stub.
const requestMock = vi.fn().mockResolvedValue([])

beforeEach(() => {
  requestMock.mockClear()
  vi.stubGlobal('useNuxtApp', () => ({ $directus: { request: requestMock } }))
  vi.stubGlobal('useRuntimeConfig', () => ({
    public: { directus: { url: 'https://directus.example.com', auth: { token: 'token' } } },
  }))
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

  it('resolves the user email via $directus before sending', async () => {
    const { useAlert } = await import('../../app/composables/useAlert')
    const composable = useAlert()

    await composable.login({ userId: 'user-123' })

    expect(requestMock).toHaveBeenCalledTimes(1)
  })
})
