// What can be shared over WebTorrent and how its .torrent is made — no Nitro
// imports, so it can be tested on its own.
import { createHash } from 'node:crypto'
import createTorrent from 'create-torrent'

/** The video URL if it may be shared (https, on an allowed host), else null. */
export function allowedSource(src: unknown, hosts: string[]): URL | null {
  let url: URL
  try { url = new URL(String(src)) } catch { return null }
  if (url.protocol !== 'https:' || url.port || url.username || url.password) return null
  const host = url.hostname.toLowerCase()
  return hosts.some((h) => host === h.toLowerCase() || host.endsWith(`.${h.toLowerCase()}`)) ? url : null
}

/** Stable short id for a video URL. */
export const sourceId = (src: string) => createHash('sha256').update(src).digest('hex').slice(0, 32)

const EXT: Record<string, string> = { 'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov', 'audio/mpeg': '.mp3', 'audio/mp4': '.m4a', 'audio/ogg': '.ogg' }

/** The media type from the file's first bytes (hosts often send application/octet-stream). */
export function sniffMedia(data: Uint8Array): string | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...data.subarray(from, to))
  if (data.length >= 12 && ascii(4, 8) === 'ftyp') return ascii(8, 11) === 'qt ' ? 'video/quicktime' : 'video/mp4'
  if (data.length >= 4 && data[0] === 0x1a && data[1] === 0x45 && data[2] === 0xdf && data[3] === 0xa3) return 'video/webm'
  if (data.length >= 4 && ascii(0, 4) === 'OggS') return 'audio/ogg'
  if (data.length >= 3 && (ascii(0, 3) === 'ID3' || (data[0] === 0xff && (data[1]! & 0xe0) === 0xe0))) return 'audio/mpeg'
  return null
}

export function torrentOf(data: Buffer, opts: Record<string, unknown>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    createTorrent(data, opts, (error: Error | null, torrent: Uint8Array) => (error ? reject(error) : resolve(Buffer.from(torrent))))
  })
}

/** The .torrent for a video: same video, same info hash (fixed name and creation date). */
export function buildTorrentFile(data: Buffer, o: { id: string, type: string, siteUrl: string, trackers: string[] }): Promise<Buffer> {
  return torrentOf(data, {
    // The name is part of the info hash: keep it the same for the same video.
    name: `${o.id}${EXT[o.type] ?? ''}`,
    urlList: [`${o.siteUrl}/api/webtorrent/seed/${o.id}`],
    announceList: o.trackers.map((t) => [t]),
    createdBy: 'Meeovi',
    creationDate: new Date('2026-01-01T00:00:00Z'),
  })
}
