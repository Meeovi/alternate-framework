import type { H3Event } from 'h3'
import { createError } from 'h3'

const ENTITY_TYPE_PATTERN = /^[A-Za-z0-9_-]{1,64}$/
const ENTITY_ID_PATTERN = /^[A-Za-z0-9:_-]{1,128}$/
const RESERVED_KEYS = new Set(['__proto__', 'prototype', 'constructor'])
const MAX_DEPTH = 4
const MAX_KEYS = 50
const MAX_ARRAY_LENGTH = 50
const MAX_STRING_LENGTH = 1000

async function loadAuthModule() {
  return import('#auth/server/utils/auth')
}

function getUserId(user: Record<string, any> | null | undefined) {
  const candidates = [user?.id, user?.userId, user?.sub]
  const resolved = candidates.find((value) => typeof value === 'string' && value.trim().length > 0)
  return resolved ? String(resolved) : null
}

export async function requireSocialUserAccess(event: H3Event) {
  try {
    const authModule = await loadAuthModule()
    const user = await authModule.requireAuth(event)
    const userId = getUserId(user as Record<string, any>)

    if (!userId) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    return { user, userId }
  } catch (error: any) {
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      throw error
    }

    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}

export async function getOptionalSocialUser(event: H3Event) {
  try {
    const authModule = await loadAuthModule()
    const session = await authModule.getAuthSession(event)

    if (!session?.user) {
      return null
    }

    const userId = getUserId(session.user as Record<string, any>)

    if (!userId) {
      return null
    }

    return { user: session.user, userId }
  } catch {
    return null
  }
}

export function sanitizeEntityType(value: unknown) {
  const entityType = String(value || '').trim()

  if (!ENTITY_TYPE_PATTERN.test(entityType)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid entityType provided' })
  }

  return entityType
}

function sanitizeEntityId(value: unknown, fieldName = 'entityId') {
  const entityId = String(value || '').trim()

  if (!ENTITY_ID_PATTERN.test(entityId)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${fieldName} provided` })
  }

  return entityId
}

export function sanitizePageParam(value: unknown, fieldName: string, options: { min?: number; max?: number; fallback: number }) {
  if (value === undefined || value === null || value === '') {
    return options.fallback
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${fieldName} provided` })
  }

  if (options.min !== undefined && parsed < options.min) {
    throw createError({ statusCode: 400, statusMessage: `${fieldName} is below the allowed range` })
  }

  if (options.max !== undefined && parsed > options.max) {
    throw createError({ statusCode: 400, statusMessage: `${fieldName} is above the allowed range` })
  }

  return parsed
}

function sanitizeStructuredValue(value: unknown, depth = 0): unknown {
  if (value === undefined || value === null) {
    return value
  }

  if (depth > MAX_DEPTH) {
    throw createError({ statusCode: 400, statusMessage: 'Request payload is too deeply nested' })
  }

  if (typeof value === 'string') {
    return value.slice(0, MAX_STRING_LENGTH)
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
    if (value.length > MAX_ARRAY_LENGTH) {
      throw createError({ statusCode: 400, statusMessage: 'Request payload array is too large' })
    }

    return value.map((entry) => sanitizeStructuredValue(entry, depth + 1))
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)

    if (entries.length > MAX_KEYS) {
      throw createError({ statusCode: 400, statusMessage: 'Request payload object is too large' })
    }

    return entries.reduce((acc, [key, entryValue]) => {
      const normalizedKey = String(key).trim()

      if (!normalizedKey || RESERVED_KEYS.has(normalizedKey) || normalizedKey.startsWith('$')) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid request payload key provided' })
      }

      acc[normalizedKey] = sanitizeStructuredValue(entryValue, depth + 1)
      return acc
    }, {} as Record<string, unknown>)
  }

  throw createError({ statusCode: 400, statusMessage: 'Unsupported request payload value' })
}