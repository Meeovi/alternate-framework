import type { H3Event } from 'h3'
import { createError, getQuery, readBody } from 'h3'

const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'])
const QUERY_KEY_PATTERN = /^[A-Za-z0-9_.\[\]-]{1,64}$/
const PATH_SEGMENT_PATTERN = /^[A-Za-z0-9._~:-]{1,120}$/
const MAX_QUERY_VALUES = 50
const MAX_QUERY_VALUE_LENGTH = 1000
const MAX_BODY_DEPTH = 5
const REQUEST_TIMEOUT_MS = 10_000

function sanitizeBaseUrl(baseUrl: string) {
  try {
    const parsed = new URL(baseUrl)

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol')
    }

    return parsed.toString().replace(/\/$/, '')
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Upstream proxy is misconfigured' })
  }
}

function sanitizePathSuffix(path: string | string[] | undefined) {
  const segments = (Array.isArray(path) ? path : [path])
    .flatMap((entry) => String(entry || '').split('/'))
    .map((entry) => entry.trim())
    .filter(Boolean)

  for (const segment of segments) {
    if (!PATH_SEGMENT_PATTERN.test(segment)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid proxy path provided' })
    }
  }

  return segments.join('/')
}

function appendQueryValue(searchParams: URLSearchParams, key: string, value: unknown, depth = 0) {
  if (value === undefined || value === null) {
    return
  }

  if (depth > MAX_BODY_DEPTH) {
    throw createError({ statusCode: 400, statusMessage: 'Query payload is too deeply nested' })
  }

  if (Array.isArray(value)) {
    if (value.length > MAX_QUERY_VALUES) {
      throw createError({ statusCode: 400, statusMessage: 'Query payload is too large' })
    }

    value.forEach((entry) => appendQueryValue(searchParams, key, entry, depth + 1))
    return
  }

  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([childKey, childValue]) => {
      if (!QUERY_KEY_PATTERN.test(childKey)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid query parameter provided' })
      }

      appendQueryValue(searchParams, `${key}[${childKey}]`, childValue, depth + 1)
    })
    return
  }

  const normalized = String(value)

  if (normalized.length > MAX_QUERY_VALUE_LENGTH) {
    throw createError({ statusCode: 400, statusMessage: 'Query parameter is too large' })
  }

  searchParams.append(key, normalized)
}

function sanitizeQuery(query: Record<string, unknown>) {
  const searchParams = new URLSearchParams()
  const entries = Object.entries(query)

  if (entries.length > MAX_QUERY_VALUES) {
    throw createError({ statusCode: 400, statusMessage: 'Query payload is too large' })
  }

  for (const [key, value] of entries) {
    if (!QUERY_KEY_PATTERN.test(key)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid query parameter provided' })
    }

    appendQueryValue(searchParams, key, value)
  }

  return searchParams.toString()
}

function sanitizeBodyValue(value: unknown, depth = 0): unknown {
  if (value === undefined || value === null) {
    return value
  }

  if (depth > MAX_BODY_DEPTH) {
    throw createError({ statusCode: 400, statusMessage: 'Request payload is too deeply nested' })
  }

  if (typeof value === 'string') {
    return value.slice(0, MAX_QUERY_VALUE_LENGTH)
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid numeric field provided' })
    }

    return value
  }

  if (typeof value === 'boolean') {
    return value
  }

  if (Array.isArray(value)) {
    if (value.length > MAX_QUERY_VALUES) {
      throw createError({ statusCode: 400, statusMessage: 'Request payload array is too large' })
    }

    return value.map((entry) => sanitizeBodyValue(entry, depth + 1))
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)

    if (entries.length > MAX_QUERY_VALUES) {
      throw createError({ statusCode: 400, statusMessage: 'Request payload object is too large' })
    }

    return entries.reduce((acc, [key, entryValue]) => {
      if (!QUERY_KEY_PATTERN.test(key) || key === '__proto__' || key === 'constructor' || key === 'prototype') {
        throw createError({ statusCode: 400, statusMessage: 'Invalid request payload key provided' })
      }

      acc[key] = sanitizeBodyValue(entryValue, depth + 1)
      return acc
    }, {} as Record<string, unknown>)
  }

  throw createError({ statusCode: 400, statusMessage: 'Unsupported request payload value' })
}

export async function proxySocialRequest(
  event: H3Event,
  options: {
    prefix: string
    baseUrl: string
    token: string
    errorMessage: string
  },
) {
  const method = String(event.node.req.method || 'GET').toUpperCase()

  if (!ALLOWED_METHODS.has(method)) {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  const baseUrl = sanitizeBaseUrl(options.baseUrl)
  const suffix = sanitizePathSuffix(event.context.params?.path)
  const upstreamPath = suffix ? `${options.prefix}/${suffix}` : options.prefix
  const queryString = sanitizeQuery(getQuery(event) as Record<string, unknown>)
  const upstreamUrl = queryString ? `${baseUrl}${upstreamPath}?${queryString}` : `${baseUrl}${upstreamPath}`
  const body = method === 'GET' || method === 'HEAD' ? undefined : sanitizeBodyValue(await readBody(event))
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(upstreamUrl, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        Authorization: `Bearer ${options.token}`,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: options.errorMessage,
      })
    }

    return data
  } catch (error: any) {
    if (error?.statusCode) {
      throw error
    }

    if (error?.name === 'AbortError') {
      throw createError({ statusCode: 504, statusMessage: `${options.errorMessage}: upstream timed out` })
    }

    throw createError({ statusCode: 502, statusMessage: options.errorMessage })
  } finally {
    clearTimeout(timeout)
  }
}