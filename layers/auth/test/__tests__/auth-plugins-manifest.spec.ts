import { describe, expect, it } from 'vitest'
import { describeAuthManifest, parseAuthManifest, resolveSettings, validateSettings } from '../../server/utils/plugins/manifest'

const valid = {
  hooks: ['user.create.before', 'request.before'],
  paths: ['/sign-up/email'],
  endpoints: [{ method: 'GET', path: '/check', access: 'public' }],
  permissions: ['user:email'],
  failMode: 'closed',
  settings: {
    mode: { type: 'select', label: 'Mode', options: ['block', 'allow'], default: 'block' },
    domains: { type: 'list', label: 'Domains', default: [] },
  },
}

describe('parseAuthManifest', () => {
  it('accepts a complete manifest and fills defaults', () => {
    const m = parseAuthManifest(valid, { id: 'email-domains', hosts: ['api.example.com'] })
    expect(m).toMatchObject({ id: 'email-domains', failMode: 'closed', timeoutMs: 2000, hosts: ['api.example.com'] })
    expect(m.endpoints).toEqual([{ method: 'GET', path: '/check', access: 'public' }])
  })

  it('lists every problem at once', () => {
    expect(() => parseAuthManifest({
      hooks: ['user.delete.before', 'request.before'],
      endpoints: [{ method: 'PUT', path: '/x/:id', access: 'everyone' }],
      permissions: ['db:all'],
      failMode: 'maybe',
      timeoutMs: 60_000,
      settings: { 'bad key': { type: 'color' }, pick: { type: 'select' } },
    }, { id: 'Bad Id', hosts: ['localhost', '10.0.0.1'] })).toThrowError(
      /id "Bad Id".*unknown hook "user\.delete\.before".*request\.\* hooks need "paths".*method must be GET or POST.*no parameters.*access must be.*unknown permission "db:all".*failMode.*timeoutMs.*setting key "bad key".*type must be one of.*a select needs options.*host "localhost".*host "10\.0\.0\.1"/,
    )
  })

  it('refuses reserved ids, plugin-prefixed paths and do-nothing plugins', () => {
    expect(() => parseAuthManifest({ hooks: ['user.create.after'] }, { id: 'enabled' })).toThrow(/reserved/)
    expect(() => parseAuthManifest({ hooks: ['request.before'], paths: ['/plugin/x'] }, { id: 'abc' })).toThrow(/isn't an auth path/)
    expect(() => parseAuthManifest({}, { id: 'abc' })).toThrow(/would do nothing/)
  })

  it('refuses defaults that fail their own validation', () => {
    expect(() => parseAuthManifest({ hooks: ['user.create.after'], settings: { n: { type: 'number', default: 'x' } } }, { id: 'abc' })).toThrow(/must be a number/)
  })
})

describe('settings', () => {
  const { settings } = parseAuthManifest(valid, { id: 'email-domains' })

  it('validates submitted values and refuses unknown keys', () => {
    expect(validateSettings(settings, { mode: 'allow', domains: [' a.com ', 'a.com', ''] })).toEqual({ mode: 'allow', domains: ['a.com'] })
    expect(() => validateSettings(settings, { mode: 'sometimes' })).toThrow(/Mode: must be one of block, allow/)
    expect(() => validateSettings(settings, { colour: 'red' })).toThrow(/Unknown setting "colour"/)
    expect(() => validateSettings(settings, ['x'])).toThrow(/must be an object/)
  })

  it('resolves stored values over defaults, dropping invalid and undeclared ones', () => {
    expect(resolveSettings(settings, null)).toEqual({ mode: 'block', domains: [] })
    expect(resolveSettings(settings, { mode: 'allow', domains: 'oops', extra: 1 })).toEqual({ mode: 'allow', domains: [] })
  })
})

describe('describeAuthManifest', () => {
  it('tells admins what the plugin can do', () => {
    const lines = describeAuthManifest(parseAuthManifest(valid, { id: 'email-domains' }))
    expect(lines).toEqual([
      'Checks every new account before it is created, and may refuse it.',
      'Checks some auth requests before they run, and may refuse them: /sign-up/email.',
      'Adds GET /api/auth/plugin/email-domains/check (anyone).',
      'Sees users\' full email addresses (otherwise only the part after the @).',
      'Makes no outside connections.',
      'If it fails or is too slow, the action it checks is refused (fails closed).',
    ])
  })
})
