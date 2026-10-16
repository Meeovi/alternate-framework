import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { isAllowedHost } from './context'

/**
 * Downloads a supplier product image for upload to Magento. The URL comes
 * from a third-party API, so this guards against SSRF: https only, the host
 * must resolve to public addresses (re-checked on every redirect), at most
 * 8 MB, and the bytes must really be JPEG / PNG / GIF (what Magento accepts).
 */
const MAX_BYTES = 8 * 1024 * 1024
const MAX_REDIRECTS = 3

function isPrivate(address: string): boolean {
  if (isIP(address) === 6) {
    const a = address.toLowerCase()
    if (a.startsWith('::ffff:')) return isPrivate(a.slice(7))
    return a === '::1' || a === '::' || a.startsWith('fc') || a.startsWith('fd') || a.startsWith('fe80')
  }
  const [a, b] = address.split('.').map(Number) as [number, number]
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224
}

async function assertPublicHttps(raw: string): Promise<URL> {
  const url = new URL(raw)
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Image URL must be plain https')
  const addresses = await lookup(url.hostname, { all: true })
  if (!addresses.length || addresses.some((a) => isPrivate(a.address))) throw new Error('Image host is not public')
  return url
}

function sniff(bytes: Buffer): 'image/jpeg' | 'image/png' | 'image/gif' | null {
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return 'image/jpeg'
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return 'image/png'
  if (bytes.subarray(0, 6).toString('latin1') === 'GIF87a' || bytes.subarray(0, 6).toString('latin1') === 'GIF89a') return 'image/gif'
  return null
}

export async function fetchImage(raw: string): Promise<{ base64: string, mimeType: 'image/jpeg' | 'image/png' | 'image/gif', fileName: string } | null> {
  let url = await assertPublicHttps(raw)
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    // Only the supplier hosts the integration declares (redirects included).
    if (!isAllowedHost(url)) return null
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20_000) })
    if (response.status >= 300 && response.status < 400) {
      const next = response.headers.get('location')
      if (!next) return null
      url = await assertPublicHttps(new URL(next, url).toString())
      continue
    }
    if (!response.ok || !response.body) return null
    if (Number(response.headers.get('content-length') || 0) > MAX_BYTES) return null

    const chunks: Buffer[] = []
    let size = 0
    for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
      size += chunk.byteLength
      if (size > MAX_BYTES) return null
      chunks.push(Buffer.from(chunk))
    }
    const bytes = Buffer.concat(chunks)
    const mimeType = sniff(bytes)
    if (!mimeType) return null // e.g. WebP, which Magento's validator refuses
    const name = url.pathname.split('/').pop()?.replace(/\.[a-z0-9]+$/i, '') || 'image'
    return { base64: bytes.toString('base64'), mimeType, fileName: name.slice(0, 60) }
  }
  return null
}
