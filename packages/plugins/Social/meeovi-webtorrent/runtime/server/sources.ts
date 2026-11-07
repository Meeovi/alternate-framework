// Which videos can be shared over WebTorrent, and the bookkeeping for them:
// a video URL (on an allowed host) gets a short id; its .torrent and the URL
// behind the id are kept in Nitro storage ('cache': Redis in production).
import { createHash } from 'node:crypto'
import { useRuntimeConfig, useStorage } from 'nitropack/runtime'

export { allowedSource, sourceId } from './media'

const TTL_SECONDS = 60 * 60 * 24 * 7

export type WebtorrentServerConfig = { sourceHosts: string[], maxBytes: number, trackers: string[], seedOrigin: string }

export const serverConfig = (): WebtorrentServerConfig => {
  const config = useRuntimeConfig() as any
  const c = config.meeoviWebtorrent ?? {}
  // Where peers fetch the web seed: WEBTORRENT_SEED_ORIGIN, else the site's address.
  const seedOrigin = String(c.seedOrigin || config.public?.siteUrl || '').replace(/\/+$/, '')
  return { sourceHosts: c.sourceHosts ?? [], maxBytes: Number(c.maxBytes) || 300 * 1024 * 1024, trackers: c.trackers ?? [], seedOrigin }
}

const storage = () => useStorage('cache')

export async function rememberSource(id: string, src: string): Promise<void> {
  await storage().setItem(`webtorrent:src-${id}`, src, { ttl: TTL_SECONDS })
}

export async function sourceFor(id: string): Promise<string | null> {
  if (!/^[0-9a-f]{32}$/.test(id)) return null
  const src = await storage().getItem<string>(`webtorrent:src-${id}`)
  return typeof src === 'string' ? src : null
}

// The .torrent names its web seed (an absolute URL), so it's cached per seed origin.
// Keys never nest (a filesystem cache can't have a key that's also a folder).
const torrentKey = (id: string, seedOrigin: string) => `webtorrent:torrent-${id}-${createHash('sha256').update(seedOrigin).digest('hex').slice(0, 12)}`

export async function cachedTorrent(id: string, seedOrigin: string): Promise<Buffer | null> {
  const b64 = await storage().getItem<string>(torrentKey(id, seedOrigin))
  return typeof b64 === 'string' && b64 ? Buffer.from(b64, 'base64') : null
}

export async function storeTorrent(id: string, seedOrigin: string, torrent: Buffer): Promise<void> {
  await storage().setItem(torrentKey(id, seedOrigin), torrent.toString('base64'), { ttl: TTL_SECONDS })
}
