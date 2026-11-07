// GET /api/webtorrent/seed/<id> — a torrent's web seed: the original video,
// with Range support, from this site's own address (the original host
// redirects and sends no CORS headers, which browsers' WebTorrent can't use).
import { createError, defineEventHandler, getHeader, getRouterParam } from 'h3'
import { allowedSource, serverConfig, sourceFor } from '../../sources'

const PASS = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'last-modified', 'etag']

export default defineEventHandler(async (event) => {
  const src = await sourceFor(String(getRouterParam(event, 'id') || ''))
  // Only ever a video we built a torrent for, on a host that's still allowed.
  if (!src || !allowedSource(src, serverConfig().sourceHosts)) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  const range = getHeader(event, 'range')
  if (range && !/^bytes=\d*-\d*$/.test(range)) throw createError({ statusCode: 416, statusMessage: 'Bad range' })

  const upstream = await fetch(src, { redirect: 'follow', headers: { 'user-agent': 'Meeovi WebTorrent/1.0', ...(range ? { range } : {}) } })
  if (!upstream.ok || !upstream.body) throw createError({ statusCode: upstream.status === 416 ? 416 : 502, statusMessage: 'The video is not available' })
  const headers = new Headers({ 'cache-control': 'public, max-age=86400', 'x-content-type-options': 'nosniff' })
  for (const name of PASS) {
    const value = upstream.headers.get(name)
    if (value) headers.set(name, value)
  }
  return new Response(upstream.body, { status: upstream.status, headers })
})
