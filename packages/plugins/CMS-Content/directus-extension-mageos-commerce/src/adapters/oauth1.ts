import { createHmac, randomBytes } from 'node:crypto'

/**
 * OAuth 1.0a request signing (HMAC-SHA256) for a Magento Integration — how
 * Magento expects integrations to call REST. Sending the access token as a
 * plain `Bearer` only works when the store enables
 * oauth/consumer/enable_integration_as_bearer (off by default since 2.4.4);
 * without it Magento silently treats the call as a guest.
 */
export interface OAuth1Credentials {
  consumerKey: string
  consumerSecret: string
  accessToken: string
  accessTokenSecret: string
}

const encode = (value: string) =>
  encodeURIComponent(value).replace(/[!*'()]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)

/** The `Authorization` header value for `method url`. Query parameters are part of the signature. */
export function oauth1Header(method: string, url: string, credentials: OAuth1Credentials, now = Date.now(), nonce = randomBytes(16).toString('hex')): string {
  const parsed = new URL(url)
  const baseUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`
  const oauth: Record<string, string> = {
    oauth_consumer_key: credentials.consumerKey,
    oauth_token: credentials.accessToken,
    oauth_signature_method: 'HMAC-SHA256',
    oauth_timestamp: String(Math.floor(now / 1000)),
    oauth_nonce: nonce,
    oauth_version: '1.0',
  }
  const params: [string, string][] = [...parsed.searchParams.entries(), ...Object.entries(oauth)]
  const normalized = params
    .map(([key, value]) => [encode(key), encode(value)] as const)
    .sort(([ak, av], [bk, bv]) => (ak === bk ? (av < bv ? -1 : av > bv ? 1 : 0) : ak < bk ? -1 : 1))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  const baseString = [method.toUpperCase(), encode(baseUrl), encode(normalized)].join('&')
  const signingKey = `${encode(credentials.consumerSecret)}&${encode(credentials.accessTokenSecret)}`
  const signature = createHmac('sha256', signingKey).update(baseString).digest('base64')
  const header = Object.entries({ ...oauth, oauth_signature: signature })
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, value]) => `${encode(key)}="${encode(value)}"`)
    .join(', ')
  return `OAuth ${header}`
}
