import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, createRouter, toWebHandler } from 'h3'
import { Webhook } from 'standardwebhooks'

// Nitro provides these at runtime.
const config = { meeoviPolar: {} as Record<string, unknown>, public: { siteUrl: 'https://shop.test' } }
const hook = vi.fn()
const session = vi.fn()
vi.stubGlobal('useRuntimeConfig', () => config)
vi.stubGlobal('useNitroApp', () => ({ hooks: { callHook: hook } }))
vi.stubGlobal('$fetch', (url: string, options: unknown) => session(url, options))

const polar = {
  checkouts: { create: vi.fn(), get: vi.fn() },
  customerSessions: { create: vi.fn() },
}
vi.mock('@polar-sh/sdk', () => ({ Polar: vi.fn(function () { return polar }) }))

const webhook = (await import('../server/api/webhook.post')).default
const checkout = (await import('../server/api/checkout.get')).default
const portal = (await import('../server/api/portal.get')).default
const { absoluteUrl, resolveProducts } = await import('../server/utils/polar')

const router = createRouter()
  .post('/webhook/polar', webhook)
  .get('/api/polar/checkout', checkout)
  .get('/api/polar/portal', portal)
const handle = toWebHandler(createApp().use(router))
const call = (path: string, init?: RequestInit) => handle(new Request(`https://shop.test${path}`, init))

const SECRET = 'whsec-test-secret'
const customerCreated = {
  type: 'customer.created',
  timestamp: '2026-10-25T12:00:00Z',
  data: {
    id: '3d3c6f43-6c8c-4d4f-9a4f-5b0d0f6f1a11', created_at: '2026-10-25T12:00:00Z', modified_at: null, metadata: {},
    external_id: 'user-1', email: 'a@b.c', email_verified: true, type: 'individual', name: 'Ann', billing_address: null, tax_id: null,
    locale: null, organization_id: '7f1f0c6a-1b2c-4d3e-8f9a-0b1c2d3e4f50', deleted_at: null, avatar_url: 'https://x/y.png',
  },
}
function signed(payload: unknown, secret = SECRET) {
  const body = JSON.stringify(payload)
  const id = `msg_${Math.random().toString(36).slice(2)}`
  const timestamp = new Date()
  const signature = new Webhook(Buffer.from(secret, 'utf-8').toString('base64')).sign(id, timestamp, body)
  return {
    method: 'POST', body,
    headers: { 'content-type': 'application/json', 'webhook-id': id, 'webhook-timestamp': String(Math.floor(timestamp.getTime() / 1000)), 'webhook-signature': signature },
  }
}

beforeEach(() => {
  config.meeoviPolar = { accessToken: 'polar_oat_test', webhookSecret: SECRET, successUrl: '/thanks?checkout_id={CHECKOUT_ID}', returnUrl: '/', products: {} }
  hook.mockReset()
  session.mockReset()
  polar.checkouts.create.mockReset()
  polar.customerSessions.create.mockReset()
})

describe('webhook', () => {
  it('passes a verified event to the polar:webhook hook', async () => {
    const response = await call('/webhook/polar', signed(customerCreated))
    expect(response.status).toBe(202)
    expect(hook).toHaveBeenCalledWith('polar:webhook', expect.objectContaining({ type: 'customer.created', data: expect.objectContaining({ externalId: 'user-1' }) }), expect.anything())
  })

  it('refuses a bad signature, and never calls the hook', async () => {
    expect((await call('/webhook/polar', signed(customerCreated, 'someone-else'))).status).toBe(403)
    expect(hook).not.toHaveBeenCalled()
  })

  it('accepts a signed event type it does not know, so Polar stops retrying', async () => {
    const response = await call('/webhook/polar', signed({ type: 'something.new', timestamp: '2026-10-25T12:00:00Z', data: {} }))
    expect(response.status).toBe(202)
    expect(await response.json()).toEqual({ received: true, handled: false })
    expect(hook).not.toHaveBeenCalled()
  })

  it('answers 500 when a listener fails, so Polar retries', async () => {
    hook.mockRejectedValue(new Error('db down'))
    expect((await call('/webhook/polar', signed(customerCreated))).status).toBe(500)
  })

  it("answers 500 for a known type the SDK can't parse, so the event isn't lost", async () => {
    const broken = { ...customerCreated, data: { ...customerCreated.data, type: 'robot' } }
    expect((await call('/webhook/polar', signed(broken))).status).toBe(500)
    expect(hook).not.toHaveBeenCalled()
  })

  it('answers 503 without a secret', async () => {
    config.meeoviPolar.webhookSecret = ''
    expect((await call('/webhook/polar', signed(customerCreated))).status).toBe(503)
  })
})

describe('checkout and portal', () => {
  it('need a signed-in user', async () => {
    expect((await call('/api/polar/checkout?products=pro')).status).toBe(401)
    expect((await call('/api/polar/portal')).status).toBe(401)
    expect(polar.checkouts.create).not.toHaveBeenCalled()
  })

  it("checks out for the account's own id and email, with absolute URLs", async () => {
    session.mockResolvedValue({ user: { id: 'user-1', email: 'a@b.c', name: 'Ann' } })
    config.meeoviPolar.products = { 'pro-monthly': 'prod-1' }
    polar.checkouts.create.mockResolvedValue({ url: 'https://polar.sh/checkout/abc' })
    const response = await call('/api/polar/checkout?products=pro-monthly&customerEmail=evil@x.y', { headers: { cookie: 'session=1' } })
    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe('https://polar.sh/checkout/abc')
    expect(polar.checkouts.create).toHaveBeenCalledWith({
      products: ['prod-1'], externalCustomerId: 'user-1', customerEmail: 'a@b.c', customerName: 'Ann',
      successUrl: 'https://shop.test/thanks?checkout_id={CHECKOUT_ID}', returnUrl: 'https://shop.test/',
    })
    expect(session).toHaveBeenCalledWith('/api/auth/get-session', { headers: { cookie: 'session=1' } })
  })

  it("sends a buyer with no Polar account a 404 from the portal", async () => {
    session.mockResolvedValue({ user: { id: 'user-1', email: 'a@b.c' } })
    polar.customerSessions.create.mockRejectedValue(Object.assign(new Error('Not found'), { statusCode: 404 }))
    expect((await call('/api/polar/portal', { headers: { cookie: 'session=1' } })).status).toBe(404)
    expect(polar.customerSessions.create).toHaveBeenCalledWith({ externalCustomerId: 'user-1', returnUrl: 'https://shop.test/' })
  })

  it('says 503 when no access token is configured', async () => {
    session.mockResolvedValue({ user: { id: 'user-1', email: 'a@b.c' } })
    config.meeoviPolar.accessToken = ''
    expect((await call('/api/polar/checkout?products=prod-1', { headers: { cookie: 'session=1' } })).status).toBe(503)
  })

  it('hides Polar outages behind a 502', async () => {
    session.mockResolvedValue({ user: { id: 'user-1', email: 'a@b.c' } })
    polar.checkouts.create.mockRejectedValue(Object.assign(new Error('boom'), { statusCode: 500 }))
    const response = await call('/api/polar/checkout?products=prod-1', { headers: { cookie: 'session=1' } })
    expect(response.status).toBe(502)
  })
})

describe('polarConfig', () => {
  it('falls back to the env names the app used before this module', async () => {
    const { polarConfig } = await import('../server/utils/polar')
    config.meeoviPolar = { accessToken: '', server: 'sandbox', webhookSecret: '', successUrl: '/' }
    vi.stubEnv('NUXT_POLAR_ACCESS_TOKEN', 'legacy-token')
    vi.stubEnv('NUXT_POLAR_SERVER', 'production')
    vi.stubEnv('NUXT_POLAR_WEBHOOK_SECRET', 'legacy-secret')
    vi.stubEnv('POLAR_SUCCESS_URL', '/done')
    expect(polarConfig()).toMatchObject({ accessToken: 'legacy-token', server: 'production', webhookSecret: 'legacy-secret', successUrl: '/done' })
    config.meeoviPolar = { accessToken: 'new-token', server: 'production', webhookSecret: 'new-secret', successUrl: '/new' }
    expect(polarConfig()).toMatchObject({ accessToken: 'new-token', webhookSecret: 'new-secret', successUrl: '/new' })
    vi.unstubAllEnvs()
  })
})

describe('resolveProducts', () => {
  const event = {} as never

  it('takes any well-formed id when no products are configured', () => {
    expect(resolveProducts(event, 'a,b')).toEqual(['a', 'b'])
    expect(() => resolveProducts(event, '')).toThrow('Choose up to 10 products')
    expect(() => resolveProducts(event, '../x')).toThrow('Choose up to 10 products')
  })

  it('only allows configured products, by slug or id', () => {
    config.meeoviPolar.products = { 'pro-monthly': 'prod-1', 'pro-yearly': 'prod-2' }
    expect(resolveProducts(event, 'pro-monthly,prod-2')).toEqual(['prod-1', 'prod-2'])
    expect(() => resolveProducts(event, 'prod-9')).toThrow('Unknown product: prod-9')
  })
})

describe('absoluteUrl', () => {
  const event = { node: { req: { url: '/x', headers: { host: 'internal:3011' } } }, path: '/x', headers: new Headers({ host: 'internal:3011' }) } as never

  it("keeps absolute URLs and puts relative ones on the site's public URL", () => {
    expect(absoluteUrl(event, 'https://other.test/a')).toBe('https://other.test/a')
    expect(absoluteUrl(event, '/thanks?checkout_id={CHECKOUT_ID}')).toBe('https://shop.test/thanks?checkout_id={CHECKOUT_ID}')
  })

  it('falls back to the request origin without a site URL', () => {
    config.public.siteUrl = ''
    expect(absoluteUrl(event, 'thanks')).toBe('http://internal:3011/thanks')
    config.public.siteUrl = 'https://shop.test'
  })
})
