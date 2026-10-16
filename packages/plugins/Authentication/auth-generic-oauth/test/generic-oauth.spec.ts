import { afterEach, describe, expect, it, vi } from 'vitest'
import genericOAuthPlugin, { configuredProviders } from '../runtime/server'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('auth-generic-oauth', () => {
  it('offers only providers whose credentials are all set', () => {
    const providers = configuredProviders({
      SLACK_CLIENT_ID: 'id', SLACK_CLIENT_SECRET: 'secret',
      OKTA_CLIENT_ID: 'id', OKTA_CLIENT_SECRET: 'secret', // no OKTA_ISSUER
      AUTH0_CLIENT_ID: ' ', AUTH0_CLIENT_SECRET: 'secret', AUTH0_DOMAIN: 'x.auth0.com',
    })
    expect(providers.map((p) => p.providerId)).toEqual(['slack'])
  })

  it('adds no plugin until a provider is configured', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    for (const key of Object.keys(process.env)) {
      if (/^(AUTH0|GUMROAD|HUBSPOT|KEYCLOAK|LINE_JP|MS|OKTA|SLACK|PATREON)_/.test(key)) vi.stubEnv(key, '')
    }
    expect(genericOAuthPlugin()).toEqual([])
  })

  it('is the generic-oauth plugin once one is', () => {
    vi.stubEnv('SLACK_CLIENT_ID', 'id')
    vi.stubEnv('SLACK_CLIENT_SECRET', 'secret')
    const plugin = genericOAuthPlugin()
    expect(Array.isArray(plugin) ? plugin : plugin.id).toBe('generic-oauth')
  })
})
