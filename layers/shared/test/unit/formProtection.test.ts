import { describe, expect, it } from 'vitest'
import { AUTH_CAPTCHA_ENDPOINTS, needsAuthCaptcha, needsTurnstile } from '../../shared/formProtection'

const needs = (method: string, path: string, body: unknown = null) => needsTurnstile(method, path, () => body)

describe('form protection', () => {
  it('covers creating and editing content through the CMS proxy', async () => {
    expect(await needs('POST', '/api/cms/items/posts')).toBe(true)
    expect(await needs('PATCH', '/api/cms/items/spaces/12')).toBe(true)
    expect(await needs('POST', '/api/cms/items/report')).toBe(true)
  })

  it('leaves one-click actions and reads alone', async () => {
    expect(await needs('POST', '/api/cms/items/reactions')).toBe(false)
    expect(await needs('PATCH', '/api/cms/items/list_items/7')).toBe(false)
    expect(await needs('GET', '/api/cms/items/posts')).toBe(false)
    expect(await needs('DELETE', '/api/cms/items/posts/3')).toBe(false)
    expect(await needs('POST', '/api/commerce/cart/items')).toBe(false)
    expect(await needs('PUT', '/api/ratings/item')).toBe(false)
  })

  it('covers uploads, checkout, newsletter and product imports', async () => {
    for (const path of ['/api/assets/upload', '/api/upload-video', '/api/social/spaces/5/media', '/api/shipment/rates',
      '/api/payment/paypal/orders', '/api/newsletter/subscribe', '/api/dropshipping/import', '/api/social/lists', '/api/social/notify-followers',
      '/api/social/atproto/post', '/api/social/publish', '/api/social/calendar/events']) {
      expect(await needs('POST', path), path).toBe(true)
    }
    expect(await needs('POST', '/api/payment/paypal/capture')).toBe(false)
    expect(await needs('POST', '/api/social/lists/4/items')).toBe(false)
  })

  it('only covers the business driver methods that save a form', async () => {
    expect(await needs('POST', '/api/business/driver', { method: 'shop.update' })).toBe(true)
    expect(await needs('POST', '/api/business/driver', { method: 'products.list' })).toBe(false)
    expect(await needs('POST', '/api/business/driver', null)).toBe(false)
  })

  it('sees through encoding, case and repeated slashes (the proxy decodes them)', async () => {
    expect(await needs('POST', '/api/cms/items/%70osts')).toBe(true)
    expect(await needs('POST', '/api/cms/items/POSTS')).toBe(true)
    expect(await needs('POST', '/api//assets//upload')).toBe(true)
    expect(await needs('POST', '/api/cms/items/%72eactions')).toBe(false)
  })

  it('never reads the body when no rule needs it', async () => {
    let read = false
    await needsTurnstile('POST', '/api/assets/upload', () => { read = true })
    expect(read).toBe(false)
  })

  it('matches the auth endpoints better-auth checks', () => {
    expect(needsAuthCaptcha('POST', '/api/auth/sign-in/email')).toBe(true)
    expect(needsAuthCaptcha('POST', '/api/auth/update-user')).toBe(true)
    expect(needsAuthCaptcha('POST', '/api/auth/sign-out')).toBe(false)
    expect(needsAuthCaptcha('GET', '/api/auth/get-session')).toBe(false)
    expect(AUTH_CAPTCHA_ENDPOINTS).toContain('/change-email')
  })
})
