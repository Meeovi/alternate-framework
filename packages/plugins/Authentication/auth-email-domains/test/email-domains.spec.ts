import { describe, expect, it } from 'vitest'
// @ts-expect-error plain ES module (it runs in the sandbox, not through TS)
import plugin, { allowed, listed } from '../sandbox/server.mjs'

const ctx = (settings: Record<string, unknown>) => {
  const store = new Map<string, unknown>()
  const audits: unknown[] = []
  return {
    store: { get: async (k: string) => store.get(k) ?? null, set: async (k: string, v: unknown) => { store.set(k, v) }, delete: async () => {}, list: async () => [] },
    audit: async (a: string, d: unknown) => { audits.push([a, d]) },
    log: () => {},
    settings,
    _store: store,
    _audits: audits,
  }
}

describe('listed', () => {
  it('matches exact domains and *. subdomains, case-insensitively', () => {
    expect(listed('Example.com', ['example.com'])).toBe(true)
    expect(listed('mail.example.com', ['*.example.com'])).toBe(true)
    expect(listed('example.com', ['*.example.com'])).toBe(false)
    expect(listed('badexample.com', ['*.example.com'])).toBe(false)
    expect(listed('other.org', ['example.com'])).toBe(false)
    expect(listed('', ['example.com'])).toBe(false)
  })
})

describe('allowed', () => {
  it('an empty list restricts nothing, in either mode', () => {
    expect(allowed('any.com', { mode: 'allow', domains: [] })).toBe(true)
    expect(allowed('any.com', { mode: 'block', domains: [' '] })).toBe(true)
  })
  it('block mode refuses listed domains', () => {
    expect(allowed('spam.io', { mode: 'block', domains: ['spam.io'] })).toBe(false)
    expect(allowed('ok.io', { mode: 'block', domains: ['spam.io'] })).toBe(true)
  })
  it('allow mode accepts only listed domains', () => {
    expect(allowed('acme.com', { mode: 'allow', domains: ['acme.com'] })).toBe(true)
    expect(allowed('gmail.com', { mode: 'allow', domains: ['acme.com'] })).toBe(false)
    expect(allowed(null, { mode: 'allow', domains: ['acme.com'] })).toBe(false)
  })
})

describe('user.create.before', () => {
  it('refuses with the configured message, counts and audits', async () => {
    const c = ctx({ mode: 'block', domains: ['spam.io'], message: 'No spam.' })
    const result = await plugin.hooks['user.create.before']({ user: { emailDomain: 'spam.io' } }, c)
    expect(result).toEqual({ deny: 'No spam.' })
    expect([...c._store.values()]).toEqual([1])
    expect(c._audits).toEqual([['sign_up_refused', { domain: 'spam.io' }]])
  })
  it('lets other sign-ups through', async () => {
    const c = ctx({ mode: 'block', domains: ['spam.io'] })
    expect(await plugin.hooks['user.create.before']({ user: { emailDomain: 'ok.io' } }, c)).toBeUndefined()
  })
})

describe('GET /check', () => {
  it('answers for an email or a domain, 400 without one', () => {
    const c = ctx({ mode: 'allow', domains: ['acme.com'] })
    expect(plugin.endpoints['GET /check']({ query: { email: 'a@acme.com' } }, c)).toEqual({ allowed: true })
    expect(plugin.endpoints['GET /check']({ query: { email: 'gmail.com' } }, c)).toEqual({ allowed: false })
    expect(plugin.endpoints['GET /check']({ query: {} }, c)).toMatchObject({ status: 400 })
  })
})
