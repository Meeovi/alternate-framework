import { createHmac } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { MageOsAdapter } from '../src/adapters/mage-os.adapter'
import { oauth1Header } from '../src/adapters/oauth1'

const credentials = { consumerKey: 'ck', consumerSecret: 'cs', accessToken: 'at', accessTokenSecret: 'ats' }

const parse = (header: string) =>
  Object.fromEntries(header.replace(/^OAuth /, '').split(', ').map((pair) => {
    const [key, value] = pair.split('=')
    return [decodeURIComponent(key!), decodeURIComponent(value!.slice(1, -1))]
  }))

describe('oauth1Header', () => {
  it('signs with HMAC-SHA256 over the method, URL and sorted params (query included)', () => {
    const header = oauth1Header('get', 'https://shop/rest/V1/stockItems/A%20B?b=2&a=1', credentials, 1_700_000_000_000, 'nonce')
    const params = parse(header)
    expect(params).toMatchObject({
      oauth_consumer_key: 'ck', oauth_token: 'at', oauth_signature_method: 'HMAC-SHA256',
      oauth_timestamp: '1700000000', oauth_nonce: 'nonce', oauth_version: '1.0',
    })
    const base = [
      'GET',
      encodeURIComponent('https://shop/rest/V1/stockItems/A%20B'),
      encodeURIComponent('a=1&b=2&oauth_consumer_key=ck&oauth_nonce=nonce&oauth_signature_method=HMAC-SHA256&oauth_timestamp=1700000000&oauth_token=at&oauth_version=1.0'),
    ].join('&')
    expect(params.oauth_signature).toBe(createHmac('sha256', 'cs&ats').update(base).digest('base64'))
  })
})

describe('MageOsAdapter REST auth', () => {
  it('signs REST calls when the integration credentials are set, fresh on each attempt', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ qty: 3, is_in_stock: true }), { status: 200 }))
    const adapter = new MageOsAdapter({ url: 'https://shop', token: 'at', consumerKey: 'ck', consumerSecret: 'cs', tokenSecret: 'ats', fetch, timeoutMs: 1000 })
    expect(await adapter.getInventory(['A'])).toEqual({ A: 3 })
    const auth = fetch.mock.calls.map(([, init]) => (init as RequestInit & { headers: Record<string, string> }).headers.Authorization)
    expect(auth).toHaveLength(2)
    expect(auth.every((value) => value?.startsWith('OAuth '))).toBe(true)
    expect(parse(auth[0]!).oauth_nonce).not.toBe(parse(auth[1]!).oauth_nonce)
  })
})
