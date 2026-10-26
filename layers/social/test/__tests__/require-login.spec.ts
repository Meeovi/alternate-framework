import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const getSession = vi.fn()

vi.stubGlobal('defineNuxtRouteMiddleware', (fn: unknown) => fn)
vi.stubGlobal('useRequestFetch', () => getSession)
vi.stubGlobal('navigateTo', (to: unknown) => ({ redirect: to }))
vi.stubGlobal('abortNavigation', (error: unknown) => ({ aborted: error }))
vi.stubGlobal('createError', (error: unknown) => error)

type Route = { path: string, fullPath: string, meta: Record<string, unknown> }
let middleware: (to: Route) => Promise<unknown>

const route = (path: string, meta: Record<string, unknown> = {}): Route => ({ path, fullPath: path, meta })

describe('require-login middleware', () => {
  beforeAll(async () => {
    middleware = (await import('../../app/middleware/require-login.global')).default as never
  })

  beforeEach(() => {
    getSession.mockReset()
    getSession.mockResolvedValue(null)
  })

  it('sends a guest on any /connect URL to the login page, marked or not', async () => {
    for (const path of ['/connect', '/connect/radio', '/connect/space/summer', '/connect/no-such-page']) {
      expect(await middleware(route(path))).toEqual({ redirect: { path: '/login', query: { redirect: path } } })
    }
  })

  it('lets a signed-in user through', async () => {
    getSession.mockResolvedValue({ user: { id: 'u1' } })
    expect(await middleware(route('/connect/radio'))).toBeUndefined()
  })

  it('leaves unmarked pages outside /connect alone', async () => {
    expect(await middleware(route('/connections'))).toBeUndefined()
    expect(await middleware(route('/'))).toBeUndefined()
    expect(getSession).not.toHaveBeenCalled()
  })

  it('fails closed when the session check errors', async () => {
    getSession.mockRejectedValue(new Error('down'))
    expect(await middleware(route('/connect/radio'))).toMatchObject({ aborted: { statusCode: 503 } })
  })
})
