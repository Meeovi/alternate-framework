import type { H3Event } from 'h3'
import { createError } from 'h3'

const COLLECTION_PATTERN = /^[A-Za-z0-9_-]{1,64}$/
const ENTITY_ID_PATTERN = /^[A-Za-z0-9:_-]{1,128}$/
const RESERVED_KEYS = new Set(['__proto__', 'prototype', 'constructor'])
const MAX_DEPTH = 6
const MAX_KEYS = 100
const MAX_ARRAY_LENGTH = 100
const MAX_STRING_LENGTH = 4000

const READABLE_CONTENT_COLLECTIONS = new Set(['lists', 'list_items', 'websites'])
const FIELD_READABLE_CONTENT_COLLECTIONS = new Set(['lists', 'list_items', 'websites'])
const MUTABLE_CONTENT_COLLECTIONS = new Set(['list_items', 'websites'])

function normalizeOwnershipValue(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

function getRoles(user: Record<string, any>): string[] {
  const candidates = [
    user.role,
    user.roles,
    user.raw_app_meta_data?.roles,
    user.raw_user_meta_data?.roles,
  ]

  return candidates.flatMap((value) => {
    if (typeof value === 'string') {
      return [value]
    }

    if (Array.isArray(value)) {
      return value.filter((entry): entry is string => typeof entry === 'string')
    }

    return []
  })
}

async function loadAuthModule() {
  return import('../../../../packages/adapters/adapter-auth/src/runtime/server/utils/auth')
}

export async function getOptionalListsUserAccess(event: H3Event) {
  try {
    const authModule = await loadAuthModule()
    const session = await authModule.getAuthSession(event)
    return session?.user || null
  } catch {
    return null
  }
}

export async function requireListsUserAccess(event: H3Event) {
  try {
    const authModule = await loadAuthModule()
    return await authModule.requireAuth(event)
  } catch (error: any) {
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      throw error
    }

    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }
}

export async function requireListsAdminAccess(event: H3Event) {
  const user = await requireListsUserAccess(event)
  const roles = getRoles(user as Record<string, any>)

  if (!roles.includes('admin')) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return user
}

export function isListsAdminUser(user: Record<string, any> | null | undefined) {
  return Boolean(user && getRoles(user).includes('admin'))
}

export function getListsOwnershipCandidates(user: Record<string, any> | null | undefined) {
  if (!user) {
    return new Set<string>()
  }

  const values = [
    user.id,
    user.userId,
    user.sub,
    user.username,
    user.login,
    user.name,
    user.email,
  ]

  return new Set(
    values
      .map((value) => normalizeOwnershipValue(value))
      .filter(Boolean),
  )
}

export function getPrimaryListsOwnerValue(user: Record<string, any> | null | undefined) {
  if (!user) {
    return null
  }

  const values = [user.id, user.userId, user.sub, user.username, user.email, user.name]
  const resolved = values.find((value) => normalizeOwnershipValue(value))
  return resolved ? String(resolved).trim() : null
}

export function getPreferredListsUsername(user: Record<string, any> | null | undefined) {
  if (!user) {
    return null
  }

  const values = [user.username, user.login, user.name, user.email]
  const resolved = values.find((value) => normalizeOwnershipValue(value))
  return resolved ? String(resolved).trim() : null
}

export function recordMatchesListsOwnership(record: Record<string, any> | null | undefined, user: Record<string, any> | null | undefined, fields: string[]) {
  if (!record) {
    return false
  }

  const candidates = getListsOwnershipCandidates(user)

  return fields.some((field) => {
    const rawValue = record[field]

    if (rawValue && typeof rawValue === 'object') {
      const nestedValues = [
        (rawValue as Record<string, any>).id,
        (rawValue as Record<string, any>).user_created,
        (rawValue as Record<string, any>).username,
        (rawValue as Record<string, any>).creator,
      ]

      return nestedValues.some((value) => candidates.has(normalizeOwnershipValue(value)))
    }

    return candidates.has(normalizeOwnershipValue(rawValue))
  })
}

export function sanitizeCollectionName(value: unknown) {
  const collection = String(value || '').trim()

  if (!COLLECTION_PATTERN.test(collection)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid collection provided' })
  }

  return collection
}

export function assertListsReadableCollection(collection: string) {
  if (!READABLE_CONTENT_COLLECTIONS.has(collection)) {
    throw createError({ statusCode: 403, statusMessage: 'Collection is not available for reading' })
  }

  return collection
}

export function assertListsFieldReadableCollection(collection: string) {
  if (!FIELD_READABLE_CONTENT_COLLECTIONS.has(collection)) {
    throw createError({ statusCode: 403, statusMessage: 'Collection schema is not available' })
  }

  return collection
}

export function assertListsMutableCollection(collection: string) {
  if (!MUTABLE_CONTENT_COLLECTIONS.has(collection)) {
    throw createError({ statusCode: 403, statusMessage: 'Collection is not available for writes' })
  }

  return collection
}

export function sanitizeEntityId(value: unknown, fieldName = 'id') {
  const normalized = String(value || '').trim()

  if (!ENTITY_ID_PATTERN.test(normalized)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${fieldName} provided` })
  }

  return normalized
}

export function sanitizeStructuredValue(value: unknown, depth = 0): unknown {
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

function sanitizeText(value: unknown, maxLength = 255) {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  return String(value).trim().slice(0, maxLength)
}

function sanitizeBoolean(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  if (typeof value === 'boolean') {
    return value
  }

  if (value === 'true' || value === '1' || value === 1) {
    return true
  }

  if (value === 'false' || value === '0' || value === 0) {
    return false
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid boolean field provided' })
}

function sanitizeStatus(value: unknown) {
  const normalized = sanitizeText(value, 32)

  if (!normalized) {
    return 'publish'
  }

  if (!['publish', 'draft', 'private', 'pending'].includes(normalized)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status provided' })
  }

  return normalized
}

export function sanitizeListsAdminUpdateInput(body: Record<string, any>) {
  return {
    title: sanitizeText(body?.title, 255),
    ispublic: sanitizeBoolean(body?.ispublic),
    description: sanitizeText(body?.description, 4000),
    image: sanitizeText(body?.image, 255),
    type: sanitizeText(body?.type, 64),
    products: sanitizeStructuredValue(body?.products),
    owner: body?.owner === undefined ? undefined : sanitizeEntityId(body.owner, 'owner'),
    status: sanitizeStatus(body?.status),
  }
}