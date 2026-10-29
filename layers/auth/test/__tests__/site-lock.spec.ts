import { describe, it, expect } from 'vitest'
import { siteLockAccess } from '../../server/utils/siteLock'

describe('siteLockAccess', () => {
  it('keeps the sign-in pages and their payloads open', () => {
    for (const p of ['/login', '/register/', '/forgot-password', '/reset-password', '/verify-email', '/callback', '/confirm', '/2fa', '/login/_payload.json']) {
      expect(siteLockAccess(p), p).toBe('open')
    }
  })

  it('keeps better-auth, static files and webhooks open', () => {
    for (const p of ['/api/auth/sign-in/email', '/api/auth/passkey/generate-authenticate-options', '/_nuxt/entry.js', '/_fonts/a.woff2', '/_i18n/x/en/messages.json', '/_ipx/w_200/images/a.png', '/favicon.ico', '/robots.txt', '/site/custom.css', '/api/payment/paypal/webhooks', '/api/shipment/webhook', '/webhook/polar', '/api/social/discussions/moderate']) {
      expect(siteLockAccess(p), p).toBe('open')
    }
  })

  it('sends pages to the login page and refuses APIs', () => {
    expect(siteLockAccess('/')).toBe('page')
    expect(siteLockAccess('/workspace')).toBe('page')
    expect(siteLockAccess('/connect/note/news-1')).toBe('page')
    expect(siteLockAccess('/u/someone/_payload.json')).toBe('page')
    expect(siteLockAccess('/llms.txt')).toBe('page')
    expect(siteLockAccess('/api/social/feed')).toBe('api')
    expect(siteLockAccess('/api/profiles/someone')).toBe('api')
    expect(siteLockAccess('/__nuxt_island/x.json')).toBe('api')
  })

  it("doesn't open look-alike paths", () => {
    expect(siteLockAccess('/loginx')).toBe('page')
    expect(siteLockAccess('/api/authx/thing')).toBe('api')
    expect(siteLockAccess('/api/payment/paypal/webhooks/extra')).toBe('api')
    expect(siteLockAccess('/_nuxtx/a.js')).toBe('page')
  })
})
