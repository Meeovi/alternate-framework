import { describe, expect, it } from 'vitest'
import anonymousPlugin, { ANONYMOUS_SIGN_IN_LIMIT } from '../runtime/server'
import anonymousClient from '../runtime/client'

describe('auth-anonymous', () => {
  it('is the better-auth anonymous plugin, limited to 5 sign-ins per IP per hour', () => {
    const plugin = anonymousPlugin()
    expect(plugin.id).toBe('anonymous')
    const rule = plugin.rateLimit.find((r) => r.pathMatcher('/sign-in/anonymous'))
    expect(rule).toMatchObject(ANONYMOUS_SIGN_IN_LIMIT)
    expect(ANONYMOUS_SIGN_IN_LIMIT).toEqual({ window: 3600, max: 5 })
    expect(plugin.rateLimit[0]!.pathMatcher('/sign-in/email')).toBe(false)
  })

  it('has a client half', () => {
    expect(anonymousClient().id).toBe('anonymous')
  })
})
