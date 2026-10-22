import { describe, expect, it } from 'vitest'
import type { Request } from 'express'
import { readConfig } from '../src/config'
import { body, email, idParam, list, number, requireTrusted, text } from '../src/http'

const config = readConfig({ MAGEOS_URL: 'https://shop', MAGEOS_TRUSTED_USERS: 'app-user, other', MAGEOS_TRUSTED_ROLES: 'role-x' })
const req = (accountability: object | null) => ({ accountability }) as unknown as Request

describe('requireTrusted', () => {
  it('allows Directus admins and listed users/roles', () => {
    expect(() => requireTrusted(req({ admin: true }), config)).not.toThrow()
    expect(() => requireTrusted(req({ user: 'app-user' }), config)).not.toThrow()
    expect(() => requireTrusted(req({ user: 'u', roles: ['role-x'] }), config)).not.toThrow()
    expect(() => requireTrusted(req({ user: 'u', role: 'role-x' }), config)).not.toThrow()
  })

  it('refuses everyone else', () => {
    for (const a of [null, { user: null }, { user: 'someone' }, { user: 'u', roles: ['role-y'] }, { admin: 'true' }]) {
      expect(() => requireTrusted(req(a), config), JSON.stringify(a)).toThrow(expect.objectContaining({ code: 'FORBIDDEN', status: 403 }))
    }
  })
})

describe('body validation', () => {
  it('reads text, numbers, lists and emails', () => {
    const input = body({ body: { name: ' Ann ', qty: '3', items: [{ key: 'A' }], mail: 'A@B.Co' } } as Request)
    expect(text(input, 'name')).toBe('Ann')
    expect(text(input, 'missing', { required: false })).toBeUndefined()
    expect(number(input, 'qty', { integer: true })).toBe(3)
    expect(list(input, 'items', 5, (i) => text(i, 'key'))).toEqual(['A'])
    expect(email(input.mail)).toBe('a@b.co')
    expect(idParam('42', 'id')).toBe('42')
  })

  it('rejects bad input with INVALID_QUERY', () => {
    const bad = [
      () => body({ body: [] } as unknown as Request),
      () => text({ name: 5 }, 'name'),
      () => text({ name: 'x'.repeat(11) }, 'name', { max: 10 }),
      () => text({}, 'name'),
      () => number({ qty: '1.5' }, 'qty', { integer: true }),
      () => number({ qty: -1 }, 'qty'),
      () => list({ items: 'nope' }, 'items', 5, () => 1),
      () => list({ items: [1, 2] }, 'items', 1, () => 1),
      () => email('not-an-email'),
      () => idParam('12a', 'id'),
      () => idParam('../1', 'id'),
    ]
    for (const fn of bad) expect(fn).toThrow(expect.objectContaining({ code: 'INVALID_QUERY' }))
  })
})
