import { defineEventHandler, readBody } from 'h3'
import { proxyMastodonRequest } from '../../utils/masto.js'
import { requireAuth } from '../../utils/auth'

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
