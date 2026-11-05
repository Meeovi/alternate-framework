import { createError, defineEventHandler, getQuery, sendStream, setResponseHeaders } from 'h3'
import { Readable } from 'node:stream'
import { useRuntimeConfig } from '#imports'
import { parseProductKey } from '../../../../app/utils/productKey'
import { redis } from '#shared/server/utils/redis'
import { PRODUCT_DOWNLOADS_KEY } from '../../../utils/homeSections'

// Where a free product's file may come from: the store's downloadable
// domains (its `downloadable:domains` whitelist). Anything else is refused,
// so this route can't be used to fetch arbitrary URLs.
const DOWNLOAD_HOSTS = new Set(['meeovi.ams3.digitaloceanspaces.com', 'cms.meeovicms.com'])

const safeFilename = (name: string) => name.replace(/[^\w.\- ()]+/g, '_').slice(0, 150) || 'download'

/**
 * GET /api/commerce/products/download?key=<product key> — a free product's
 * file, sent as an attachment from this site, so the button downloads it
 * (browsers ignore `download` on another origin's link and just open the
 * file) and the storage URL is never shown. Public, like the button.
 *  - `<backend>:<sku>`: the Directus mirror's download_url (set only when
 *    the product is free and its seller allows downloading it)
 *  - a Directus product id: its `file` when the product is free, else its
 *    mirrored download_url (a store product opened by its Directus id)
 */
export default defineEventHandler(async (event) => {
  const key = String(getQuery(event).key ?? '').trim()
  if (!key || key.length > 160) throw createError({ statusCode: 400, statusMessage: 'Missing product key' })

  const config = useRuntimeConfig(event)
  const directusUrl = ((config.public as { directus?: { url?: string } }).directus?.url || '').replace(/\/+$/, '')
  const token = (config as { directus?: { token?: string } }).directus?.token
  if (!directusUrl) throw createError({ statusCode: 503, statusMessage: 'Downloads are unavailable' })
  const auth = token ? { Authorization: `Bearer ${token}` } : {}

  // The mirror's download_url, when it's on an allowed host.
  const fromDownloadUrl = (raw?: string | null) => {
    let url: URL | null = null
    try { url = raw ? new URL(raw) : null } catch { url = null }
    return url && url.protocol === 'https:' && DOWNLOAD_HOSTS.has(url.hostname)
      ? { url: url.href, headers: {}, filename: decodeURIComponent(url.pathname.split('/').pop() || '') }
      : null
  }

  const backend = parseProductKey(key)
  let source: { url: string, headers: Record<string, string>, filename: string } | null = null
  if (backend) {
    const res = await $fetch<{ data?: { download_url?: string | null }[] }>(`${directusUrl}/items/products`, {
      query: {
        fields: 'download_url',
        filter: JSON.stringify({ _and: [{ mageos_sku: { _eq: backend.key } }, { status: { _eq: 'published' } }] }),
        limit: 1,
      },
      headers: auth,
      timeout: 8000,
    }).catch(() => null)
    source = fromDownloadUrl(res?.data?.[0]?.download_url)
  } else if (/^\d{1,12}$/.test(key)) {
    // A Directus product: its own file when free, else (a store product's
    // mirror row, opened by its Directus id) the mirror's download_url.
    const res = await $fetch<{ data?: { status?: string, price?: string | number | null, download_url?: string | null, file?: { id?: string, filename_download?: string } | null } }>(
      `${directusUrl}/items/products/${key}`,
      { query: { fields: 'status,price,download_url,file.id,file.filename_download' }, headers: auth, timeout: 8000 },
    ).catch(() => null)
    const product = res?.data
    if (product?.status === 'published') {
      if (product.file?.id && !(Number(product.price) > 0)) {
        source = { url: `${directusUrl}/assets/${encodeURIComponent(product.file.id)}`, headers: auth, filename: product.file.filename_download || '' }
      } else {
        source = fromDownloadUrl(product.download_url)
      }
    }
  }
  if (!source) throw createError({ statusCode: 404, statusMessage: 'No free download for this product' })

  const upstream = await fetch(source.url, { headers: source.headers }).catch(() => null)
  if (!upstream?.ok || !upstream.body) throw createError({ statusCode: 502, statusMessage: 'The file could not be fetched' })

  // Counted for Best Sellers (most downloaded and purchased), by the
  // product's key. Never holds up or fails the download.
  redis.hincrby(PRODUCT_DOWNLOADS_KEY, backend ? `${backend.backend}:${backend.key}` : key, 1)
    .catch((error: unknown) => console.error('[download] count failed:', (error as Error)?.message || error))

  const filename = safeFilename(source.filename)
  setResponseHeaders(event, {
    'content-type': upstream.headers.get('content-type') || 'application/octet-stream',
    'content-disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    'cache-control': 'private, no-store',
    'x-content-type-options': 'nosniff',
    ...(upstream.headers.get('content-length') ? { 'content-length': upstream.headers.get('content-length')! } : {}),
  })
  return sendStream(event, Readable.fromWeb(upstream.body as any))
})
