// GET /api/webtorrent/torrent?src=<video URL> — the video's .torrent.
// Built once per video (the file is read through, hashed into pieces, and
// the torrent cached for a week); its web seed is /api/webtorrent/seed/<id>
// on this site, so peers can always fall back to the original file.
import { createError, defineEventHandler, getQuery, setResponseHeaders } from 'h3'
import { buildTorrentFile, sniffMedia } from '../media'
import { allowedSource, cachedTorrent, rememberSource, serverConfig, sourceId, storeTorrent } from '../sources'

const MAX_PARALLEL_BUILDS = 2
const building = new Map<string, Promise<Buffer>>()


async function download(src: string, maxBytes: number): Promise<{ data: Buffer, type: string }> {
  const res = await fetch(src, { redirect: 'follow', headers: { 'user-agent': 'Meeovi WebTorrent/1.0' } })
  if (!res.ok || !res.body) throw createError({ statusCode: 404, statusMessage: 'That video is not available' })
  const declared = Number(res.headers.get('content-length') || 0)
  if (declared > maxBytes) throw createError({ statusCode: 413, statusMessage: 'That video is too large to share peer-to-peer' })
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBytes) {
      await reader.cancel().catch(() => {})
      throw createError({ statusCode: 413, statusMessage: 'That video is too large to share peer-to-peer' })
    }
    chunks.push(value)
  }
  return { data: Buffer.concat(chunks), type: String(res.headers.get('content-type') || '').split(';')[0]!.trim().toLowerCase() }
}

async function build(id: string, src: string): Promise<Buffer> {
  const config = serverConfig()
  const siteUrl = config.seedOrigin
  const downloaded = await download(src, config.maxBytes)
  const data = downloaded.data
  const type = /^(video|audio)\//.test(downloaded.type) ? downloaded.type : sniffMedia(data) ?? ''
  if (!/^(video|audio)\//.test(type)) throw createError({ statusCode: 415, statusMessage: 'Only videos and audio are shared peer-to-peer' })
  await rememberSource(id, src)
  const torrent = await buildTorrentFile(data, { id, type, siteUrl, trackers: config.trackers })
  await storeTorrent(id, siteUrl, torrent)
  return torrent
}

export default defineEventHandler(async (event) => {
  const config = serverConfig()
  const url = allowedSource(getQuery(event).src, config.sourceHosts)
  if (!url) throw createError({ statusCode: 400, statusMessage: 'That video can\'t be shared peer-to-peer' })
  const src = url.href
  const id = sourceId(src)

  if (!/^https?:\/\//.test(config.seedOrigin)) throw createError({ statusCode: 500, statusMessage: 'NUXT_PUBLIC_SITE_URL is not set' })
  let torrent = await cachedTorrent(id, config.seedOrigin)
  if (!torrent) {
    let pending = building.get(id)
    if (!pending) {
      if (building.size >= MAX_PARALLEL_BUILDS) throw createError({ statusCode: 503, statusMessage: 'Busy, try again shortly' })
      pending = build(id, src).finally(() => building.delete(id))
      building.set(id, pending)
    }
    torrent = await pending
  }
  setResponseHeaders(event, {
    'content-type': 'application/x-bittorrent',
    'cache-control': 'public, max-age=3600',
    'x-content-type-options': 'nosniff',
  })
  return torrent
})
