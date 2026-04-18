import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../../utils/auth'

const getMastodonBaseUrl = () => {
  const baseUrl =
    process.env.MASTODON_API_BASE_URL ||
    process.env.MASTODON_BASE_URL ||
    process.env.NUXT_PUBLIC_MASTODON_BASE_URL ||
    ''

  return String(baseUrl).replace(/\/$/, '')
}

const forwardHeaders = (headers: Record<string, string | string[] | undefined>) => {
  const nextHeaders: Record<string, string> = {}

  for (const [key, value] of Object.entries(headers)) {
    if (value == null) continue

    const lowerKey = key.toLowerCase()
    if (['host', 'connection', 'content-length'].includes(lowerKey)) continue

    nextHeaders[key] = Array.isArray(value) ? value.join(', ') : value
  }

  return nextHeaders
}

const proxyMastodonRequest = async (
  path: string,
  method: string,
  headers: Record<string, string | string[] | undefined>,
  body?: unknown,
) => {
  const baseUrl = getMastodonBaseUrl()
  if (!baseUrl) {
    throw new Error('Mastodon base URL is not configured')
  }

  const targetUrl = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
  const response = await fetch(targetUrl, {
    method,
    headers: forwardHeaders(headers),
    body: body == null ? undefined : JSON.stringify(body),
  })

  const responseHeaders: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : await response.text()

  return {
    status: response.status,
    headers: responseHeaders,
    data,
  }
}

export default defineEventHandler(async (event) => {
  const req = event.node.req
  const method = (req.method || 'GET').toUpperCase()
  // Strip the prefix '/api/masto' from the path so callers can use
  // `/api/masto/api/v1/...` to reach the underlying instance path `/api/v1/...`
  const prefix = '/api/masto'
  const fullUrl = req.url || ''
  const path = fullUrl.startsWith(prefix) ? fullUrl.slice(prefix.length) : fullUrl

  // Require authentication for mutating operations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    await requireAuth(event)
  }

  const body = (method === 'GET' || method === 'HEAD') ? undefined : await readBody(event)

  try {
    const result = await proxyMastodonRequest(path, method, req.headers as any, body)
    event.node.res.statusCode = result.status
    for (const [k, v] of Object.entries(result.headers || {})) {
      try { event.node.res.setHeader(k, String(v)) } catch (e) { /* ignore */ }
    }
    return result.data
  } catch (e: unknown) {
    event.node.res.statusCode = 502
    const message = e instanceof Error ? e.message : String(e)
    return { error: message }
  }
})
