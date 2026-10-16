import { createError, defineEventHandler, getRequestURL, setResponseHeaders } from 'h3'
import { findPlugin, integrationsUser, sandboxAssetName, sandboxCsp } from './utils/installs'

/**
 * GET <sandboxBase>/<slug>/<file> — a sandboxed plugin's own UI files
 * (`__sdk.js` is the bridge SDK). The page that embeds them uses
 * <iframe sandbox="allow-scripts">: an opaque origin with no cookies,
 * storage or access to the app. This response's enforced CSP adds:
 *  - scripts / styles / images / fonts only from this plugin's sandbox folder
 *  - fetch / XHR / WebSocket only to the plugin's declared outside hosts
 *    (none by default — not even this app's API)
 *  - no frames, workers, forms, plugins, <base>; embeddable only by this app
 */

const TYPES: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
  json: 'application/json; charset=utf-8',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  ico: 'image/x-icon',
  woff: 'font/woff',
  woff2: 'font/woff2',
  txt: 'text/plain; charset=utf-8',
}

const SEGMENT_RE = /^[a-z0-9_][a-z0-9._-]{0,99}$/i

export default defineEventHandler(async (event) => {
  const notFound = () => createError({ statusCode: 404, statusMessage: 'Not found' })
  const { sandboxBase } = (useRuntimeConfig(event).public as Record<string, any>).meeoviIntegrations ?? {}
  const base = String(sandboxBase || '/integration-sandbox').replace(/\/+$/, '')

  // Behind the proxy: Host is preserved, the scheme comes from X-Forwarded-Proto.
  const url = getRequestURL(event, { xForwardedProto: true })
  if (!url.pathname.startsWith(`${base}/`)) throw notFound()
  // Only plain segments: no dot-segments, encoded separators or backslashes.
  // (A trailing slash — `<slug>/` — leaves one empty last segment.)
  const parts = url.pathname.slice(base.length + 1).split('/')
  if (parts.at(-1) === '' && parts.length > 1) parts.pop()
  if (!parts.length || parts.some((p) => !SEGMENT_RE.test(p) || p.startsWith('.'))) throw notFound()
  const [slug, ...rest] = parts

  // Admin plugins don't exist for anyone else (they aren't sandboxed anyway).
  const plugin = findPlugin(event, await integrationsUser(event).catch(() => null), slug!)
  if (!plugin?.sandbox) throw notFound()

  // A bare `<slug>/` serves the entry file.
  const file = rest.length ? rest.join('/') : plugin.sandbox.entry
  const ext = file.split('.').pop()?.toLowerCase() ?? ''
  const type = TYPES[ext]
  if (!type) throw notFound()

  const storage = file === '__sdk.js'
    ? useStorage('assets:meeovi-sandbox-sdk')
    : useStorage(`assets:${sandboxAssetName(plugin.slug)}`)
  const body = await storage.getItemRaw(file === '__sdk.js' ? 'sdk.js' : file.split('/').join(':'))
  if (body === null || body === undefined) throw notFound()

  const origin = url.origin
  setResponseHeaders(event, {
    'Content-Type': type,
    'Content-Security-Policy': sandboxCsp(`${origin}${base}/${plugin.slug}/`, plugin.hosts),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), hid=(), display-capture=(), clipboard-read=()',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cache-Control': 'no-cache',
    'X-Robots-Tag': 'noindex, nofollow',
  })
  return body
})
