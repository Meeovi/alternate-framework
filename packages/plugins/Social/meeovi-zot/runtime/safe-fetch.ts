// Fetching from servers a member names (their GNU social server, a WebFinger
// domain). The site runs next to private services, so a request may only go
// to a public address over https on port 443: the address is checked when
// the connection is made (not just before — no DNS-rebinding window), and
// every redirect is checked again. Bodies are capped.
//
// The same file lives in meeovi-ostatus; keep the two in step.
import { lookup as dnsLookup, type LookupAddress } from 'node:dns'
import { BlockList, isIP } from 'node:net'
import { Agent, fetch as undiciFetch } from 'undici'

const BLOCKED = new BlockList()
for (const [net, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12],
  ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24],
  ['224.0.0.0', 4], ['240.0.0.0', 4],
] as const) BLOCKED.addSubnet(net, prefix, 'ipv4')
for (const [net, prefix] of [['::', 128], ['::1', 128], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8], ['2001:db8::', 32], ['64:ff9b::', 96]] as const) BLOCKED.addSubnet(net, prefix, 'ipv6')

/** True for loopback, private, link-local, CGNAT, multicast and reserved addresses. */
export function isPrivateAddress(address: string): boolean {
  const family = isIP(address)
  if (family === 4) return BLOCKED.check(address, 'ipv4')
  if (family === 6) {
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address)
    if (mapped) return BLOCKED.check(mapped[1]!, 'ipv4')
    return BLOCKED.check(address, 'ipv6')
  }
  return true
}

export class UnsafeUrlError extends Error {}

/** https URL on the default port, with a dotted public hostname. */
export function assertSafeUrl(input: string | URL): URL {
  let url: URL
  try { url = new URL(String(input)) } catch { throw new UnsafeUrlError('That is not a valid address') }
  if (url.protocol !== 'https:') throw new UnsafeUrlError('The server must use https')
  if (url.port && url.port !== '443') throw new UnsafeUrlError('The server must use the standard https port')
  if (url.username || url.password) throw new UnsafeUrlError('Put the username and password in their own fields')
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (isIP(host) ? isPrivateAddress(host) : !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host) || /\.(local|internal|localhost|home|lan)$/i.test(host)) {
    throw new UnsafeUrlError('That server is not reachable from Meeovi')
  }
  return url
}

const safeLookup = ((hostname: string, options: any, callback: any) => {
  dnsLookup(hostname, { ...options, all: true }, (error, addresses: LookupAddress[]) => {
    if (error) return callback(error)
    const list = Array.isArray(addresses) ? addresses : [addresses as unknown as LookupAddress]
    const usable = list.filter((a) => !isPrivateAddress(a.address))
    if (!usable.length) return callback(new UnsafeUrlError(`${hostname} is not a public server`))
    if (options?.all) return callback(null, usable)
    callback(null, usable[0]!.address, usable[0]!.family)
  })
}) as any

const agent = new Agent({ connect: { lookup: safeLookup, timeout: 10_000 }, headersTimeout: 15_000, bodyTimeout: 20_000 })

const MAX_REDIRECTS = 3
const DEFAULT_MAX_BYTES = 2 * 1024 * 1024

export type SafeResponse = { status: number, ok: boolean, url: string, headers: Headers, text: string }

export type SafeFetchInit = {
  method?: string
  headers?: Record<string, string>
  body?: string | URLSearchParams
  /** Cap on the body read (default 2 MB). */
  maxBytes?: number
}

const USER_AGENT = 'Meeovi/1.0 (+https://meeovi.com)'

/** fetch() for member-supplied servers: https, public addresses only, capped body, text out. */
export async function safeFetch(input: string | URL, init: SafeFetchInit = {}): Promise<SafeResponse> {
  let url = assertSafeUrl(input)
  let method = (init.method || 'GET').toUpperCase()
  let body = init.body
  for (let hop = 0; ; hop++) {
    const response = await undiciFetch(url, {
      method,
      headers: { 'user-agent': USER_AGENT, ...init.headers },
      body: body as any,
      redirect: 'manual',
      dispatcher: agent,
    })
    const location = response.headers.get('location')
    if (response.status >= 300 && response.status < 400 && location) {
      await response.body?.cancel().catch(() => {})
      if (hop >= MAX_REDIRECTS) throw new Error('Too many redirects')
      url = assertSafeUrl(new URL(location, url))
      // 303 (and 301/302 after POST, as browsers do) become a GET without a body.
      if (response.status === 303 || ((response.status === 301 || response.status === 302) && method === 'POST')) { method = 'GET'; body = undefined }
      continue
    }
    return { status: response.status, ok: response.ok, url: url.href, headers: response.headers as unknown as Headers, text: await readCapped(response, init.maxBytes ?? DEFAULT_MAX_BYTES) }
  }
}

async function readCapped(response: Awaited<ReturnType<typeof undiciFetch>>, maxBytes: number): Promise<string> {
  if (!response.body) return ''
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBytes) { await reader.cancel().catch(() => {}); throw new Error('The server sent too much data') }
    chunks.push(value)
  }
  return Buffer.concat(chunks).toString('utf8')
}

/** safeFetch + JSON.parse; throws with the status on a non-2xx answer. */
export async function safeJson<T = any>(input: string | URL, init: SafeFetchInit = {}): Promise<T> {
  const res = await safeFetch(input, { ...init, headers: { accept: 'application/json', ...init.headers } })
  if (!res.ok) throw Object.assign(new Error(`${new URL(res.url).host} answered ${res.status}`), { status: res.status })
  try { return JSON.parse(res.text) as T } catch { throw new Error(`${new URL(res.url).host} did not answer with JSON`) }
}
