import { appendQuery, createError, getQuery, readBody } from 'h3'

const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'])
const SAFE_SEGMENT_PATTERN = /^[A-Za-z0-9._~-]+$/
const SAFE_QUERY_KEY_PATTERN = /^[A-Za-z0-9._-]{1,64}$/
const MAX_QUERY_KEYS = 20
const MAX_QUERY_VALUE_LENGTH = 256
const MAX_BODY_LENGTH = 32_768

function sanitizeBackendUrl(baseUrl: string) {
  let parsed: URL

  try {
    parsed = new URL(baseUrl)
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Lists backend API is invalid' })
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw createError({ statusCode: 500, statusMessage: 'Lists backend API is invalid' })
  }

  return parsed.toString().replace(/\/$/, '')
}

function sanitizeSuffix(suffix: string) {
  if (!suffix) {
    return ''
  }

  const segments = suffix.split('/').filter(Boolean)

  if (segments.length > 12) {
    throw createError({ statusCode: 400, statusMessage: 'Request path is too deep' })
  }

  for (const segment of segments) {
    if (segment === '.' || segment === '..' || !SAFE_SEGMENT_PATTERN.test(segment)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid request path' })
    }
  }

  return segments.length ? `/${segments.join('/')}` : ''
}

function sanitizeQuery(query: Record<string, unknown>) {
  const entries = Object.entries(query)

  if (entries.length > MAX_QUERY_KEYS) {
    throw createError({ statusCode: 400, statusMessage: 'Too many query parameters' })
  }

  return entries.reduce<Record<string, string | string[]>>((accumulator, [key, value]) => {
    if (!SAFE_QUERY_KEY_PATTERN.test(key)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid query parameter' })
    }

    if (Array.isArray(value)) {
      accumulator[key] = value.map((entry) => {
        const normalized = String(entry).trim()
        if (normalized.length > MAX_QUERY_VALUE_LENGTH) {
          throw createError({ statusCode: 400, statusMessage: 'Query parameter is too long' })
        }
        return normalized
      })
      return accumulator
    }

    const normalized = String(value ?? '').trim()

    if (normalized.length > MAX_QUERY_VALUE_LENGTH) {
      throw createError({ statusCode: 400, statusMessage: 'Query parameter is too long' })
    }

    accumulator[key] = normalized
    return accumulator
  }, {})
}

function sanitizeRequestBody(body: unknown) {
  if (body === undefined) {
    return undefined
  }

  const serialized = JSON.stringify(body)

  if (serialized.length > MAX_BODY_LENGTH) {
    throw createError({ statusCode: 413, statusMessage: 'Request body is too large' })
  }

  return serialized
}

function getListsBackendConfig(event: Parameters<typeof getQuery>[0]) {
  const config = useRuntimeConfig(event)
  const baseUrl = config.listsApi?.baseUrl

  if (!baseUrl) {
    throw createError({ statusCode: 500, statusMessage: 'Lists backend API is not configured' })
  }

  return {
    baseUrl: sanitizeBackendUrl(String(baseUrl)),
    apiToken: config.listsApi?.apiToken ? String(config.listsApi.apiToken) : '',
    timeoutMs: Number(config.listsApi?.timeoutMs || config.mApiTimeoutMs || 15000),
  }
}

export async function proxyListsRequest(event: Parameters<typeof getQuery>[0], suffix = '') {
  const { baseUrl, apiToken, timeoutMs } = getListsBackendConfig(event)
  const method = (event.method || 'GET').toUpperCase()

  if (!ALLOWED_METHODS.has(method)) {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  const query = sanitizeQuery(getQuery(event) as Record<string, unknown>)
  const safeSuffix = sanitizeSuffix(suffix)
  const url = Object.keys(query).length > 0
    ? appendQuery(`${baseUrl}/lists${safeSuffix}`, query)
    : `${baseUrl}/lists${safeSuffix}`
  const body = method === 'GET' || method === 'HEAD' ? undefined : await readBody(event)
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined
  const timeout = controller ? setTimeout(() => controller.abort(), timeoutMs) : undefined

  let response: Response

  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
      },
      body: sanitizeRequestBody(body),
      signal: controller?.signal,
    })
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Lists backend request failed' })
  } finally {
    if (timeout) {
      clearTimeout(timeout)
    }
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: 'Lists backend request failed',
      data: {
        upstreamStatus: response.status,
      },
    })
  }

  return data
}