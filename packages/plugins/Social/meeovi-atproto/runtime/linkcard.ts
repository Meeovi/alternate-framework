// A link card (app.bsky.embed.external) for a post: the page's title, a
// short description and a thumbnail, shown under the post in Bluesky apps.
// Used when Meeovi posts a product or a member's note to Bluesky
// (layers/social server/utils/crosspost.ts).
//
// The thumbnail is downloaded here and uploaded as a blob. Its address can
// come from a member (a note's image link), so the download guards against
// SSRF: https only, the host must resolve to public addresses (re-checked
// on every redirect), and the bytes must really be an image under Bluesky's
// 1 MB blob limit. A thumbnail that fails any check is left out; the card
// is still posted.
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import type { AtprotoClient } from './client'

export type LinkCard = {
  /** The page the card opens (https). */
  url: string
  title: string
  description: string
  /** Thumbnail image address (https). */
  image?: string
}

const MAX_BYTES = 976 * 1024
const MAX_REDIRECTS = 3

export function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 6) {
    const a = address.toLowerCase()
    if (a.startsWith('::ffff:')) return isPrivateAddress(a.slice(7))
    return a === '::1' || a === '::' || a.startsWith('fc') || a.startsWith('fd') || a.startsWith('fe80')
  }
  const [a, b] = address.split('.').map(Number) as [number, number]
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224
}

async function publicHttps(raw: string): Promise<URL | null> {
  let url: URL
  try { url = new URL(raw) } catch { return null }
  if (url.protocol !== 'https:' || url.username || url.password) return null
  const addresses = await lookup(url.hostname, { all: true }).catch(() => [])
  if (!addresses.length || addresses.some((a) => isPrivateAddress(a.address))) return null
  return url
}

export function sniffImage(bytes: Uint8Array): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | null {
  const b = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return 'image/jpeg'
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return 'image/png'
  const head = b.subarray(0, 6).toString('latin1')
  if (head === 'GIF87a' || head === 'GIF89a') return 'image/gif'
  if (b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return 'image/webp'
  return null
}

/** Downloads a thumbnail, or null when it isn't a safe, small enough image. */
export async function fetchThumbnail(raw: string): Promise<{ bytes: Uint8Array, mimeType: string } | null> {
  let url = await publicHttps(raw)
  for (let hop = 0; url && hop <= MAX_REDIRECTS; hop++) {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15_000) }).catch(() => null)
    if (!response) return null
    if (response.status >= 300 && response.status < 400) {
      const next = response.headers.get('location')
      url = next ? await publicHttps(new URL(next, url).toString()) : null
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
    const bytes = new Uint8Array(Buffer.concat(chunks))
    const mimeType = sniffImage(bytes)
    return mimeType ? { bytes, mimeType } : null
  }
  return null
}

/** The card as an embed, with its thumbnail uploaded to the poster's PDS. */
export async function linkCardEmbed(client: AtprotoClient, card: LinkCard) {
  if (!/^https:\/\//.test(card.url)) throw new Error('A link card needs an https address')
  const thumbnail = card.image ? await fetchThumbnail(card.image).catch(() => null) : null
  const thumb = thumbnail ? await client.uploadImage(thumbnail.bytes, thumbnail.mimeType).catch(() => undefined) : undefined
  return {
    uri: card.url,
    title: card.title.slice(0, 300),
    description: card.description.slice(0, 1000),
    ...(thumb ? { thumb } : {}),
  }
}
