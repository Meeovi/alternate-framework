import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import {
  assertListsFieldReadableCollection,
  assertListsMutableCollection,
  assertListsReadableCollection,
  getOptionalListsUserAccess,
  getPreferredListsUsername,
  getPrimaryListsOwnerValue,
  isListsAdminUser,
  recordMatchesListsOwnership,
  requireListsUserAccess,
  sanitizeCollectionName,
  sanitizeEntityId,
  sanitizeStructuredValue,
} from '../../utils/access'
import { buildDirectusUrl, getListsContentConfig } from '../../utils/lists-content'
import { createMeeoviHttpError } from '../../utils/meeovi-error'

const WRITE_OPERATIONS = new Set(['createItem', 'updateItem', 'deleteItem'])
const ALLOWED_OPERATIONS = new Set(['readItems', 'readItem', 'readFieldsByCollection', 'createItem', 'updateItem', 'deleteItem'])
const LISTS_UPSTREAM_TIMEOUT_MS = 10_000

const listsContentBodySchema = z.object({
  operation: z.enum(['readItems', 'readItem', 'readFieldsByCollection', 'createItem', 'updateItem', 'deleteItem']),
  collection: z.coerce.string().trim().min(1),
  id: z.union([z.string(), z.number()]).optional(),
  opts: z.unknown().optional(),
  data: z.unknown().optional(),
}).superRefine((value, ctx) => {
  if ((value.operation === 'readItem' || value.operation === 'updateItem' || value.operation === 'deleteItem') && (value.id === undefined || value.id === null || value.id === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'id is required for this operation',
      path: ['id'],
    })
  }
})

function validateListsContentBody(rawBody: unknown) {
  const parsed = listsContentBodySchema.safeParse(rawBody)

  if (!parsed.success) {
    throw createMeeoviHttpError(400, parsed.error.issues[0]?.message || 'Invalid lists content payload')
  }

  return parsed.data
}

function sanitizeOperation(value: unknown) {
  const operation = String(value || '').trim()

  if (!ALLOWED_OPERATIONS.has(operation)) {
    throw createError({ statusCode: 400, statusMessage: `Unsupported content operation: ${operation}` })
  }

  return operation
}

function isPublicRecord(record: Record<string, any> | null | undefined) {
  const status = String(record?.status || '').trim().toLowerCase()
  return status === 'public' || status === 'publish'
}

function resolveRelationId(value: unknown, fieldName: string) {
  if (value && typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
    return sanitizeEntityId((value as Record<string, unknown>).id, fieldName)
  }

  return sanitizeEntityId(value, fieldName)
}

async function fetchDirectusJson(url: string, apiToken: string) {
  const response = await fetchDirectusWithTimeout(url, apiToken, {
    method: 'GET',
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw createError({ statusCode: response.status, statusMessage: 'Lists content request failed' })
  }

  return data?.data ?? data
}

async function fetchDirectusWithTimeout(
  requestUrl: string,
  apiToken: string,
  options: {
    method: string
    payload?: Record<string, any>
  },
) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), LISTS_UPSTREAM_TIMEOUT_MS)

  try {
    return await fetch(requestUrl, {
      method: options.method,
      headers: {
        Accept: 'application/json',
        ...(options.payload !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
      },
      body: options.payload !== undefined ? JSON.stringify(options.payload) : undefined,
      signal: controller.signal,
    })
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw createError({ statusCode: 504, statusMessage: 'Lists content request timed out' })
    }

    throw createError({ statusCode: 502, statusMessage: 'Lists content request failed' })
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchDirectusItem(baseUrl: string, apiToken: string, collection: string, id: string, fields: string[]) {
  const itemUrl = buildDirectusUrl(baseUrl, `/items/${collection}/${encodeURIComponent(id)}`, { fields: fields.join(',') })
  return await fetchDirectusJson(itemUrl, apiToken)
}

async function fetchParentList(baseUrl: string, apiToken: string, listId: string) {
  return await fetchDirectusItem(baseUrl, apiToken, 'lists', listId, ['id', 'user_created', 'status'])
}

function assertOwnedRecord(record: Record<string, any> | null | undefined, user: Record<string, any>, fields: string[], fallbackMessage: string) {
  if (isListsAdminUser(user)) {
    return
  }

  if (!recordMatchesListsOwnership(record, user, fields)) {
    throw createError({ statusCode: 403, statusMessage: fallbackMessage })
  }
}

async function authorizeWebsiteRead(baseUrl: string, apiToken: string, user: Record<string, any> | null, id: string) {
  const website = await fetchDirectusItem(baseUrl, apiToken, 'websites', id, ['id', 'creator', 'username', 'status'])

  if (isListsAdminUser(user) || isPublicRecord(website) || recordMatchesListsOwnership(website, user, ['creator', 'username'])) {
    return
  }

  throw createError({ statusCode: 403, statusMessage: 'Website access denied' })
}

async function authorizeWebsiteWrite(baseUrl: string, apiToken: string, user: Record<string, any>, id: string) {
  const website = await fetchDirectusItem(baseUrl, apiToken, 'websites', id, ['id', 'creator', 'username'])
  assertOwnedRecord(website, user, ['creator', 'username'], 'Website access denied')
}

async function authorizeListItemParent(baseUrl: string, apiToken: string, user: Record<string, any> | null, listId: string, allowPublicRead = false) {
  const list = await fetchParentList(baseUrl, apiToken, listId)

  if (isListsAdminUser(user)) {
    return list
  }

  if (recordMatchesListsOwnership(list, user, ['user_created'])) {
    return list
  }

  if (allowPublicRead && isPublicRecord(list)) {
    return list
  }

  throw createError({ statusCode: 403, statusMessage: 'List item access denied' })
}

async function authorizeListItemRead(baseUrl: string, apiToken: string, user: Record<string, any> | null, id: string) {
  const item = await fetchDirectusItem(baseUrl, apiToken, 'list_items', id, ['id', 'user_created', 'list_id', 'status'])

  if (isListsAdminUser(user) || recordMatchesListsOwnership(item, user, ['user_created']) || isPublicRecord(item)) {
    return
  }

  const listId = item?.list_id ? sanitizeEntityId(item.list_id, 'list') : null
  if (!listId) {
    throw createError({ statusCode: 403, statusMessage: 'List item access denied' })
  }

  await authorizeListItemParent(baseUrl, apiToken, user, listId, true)
}

async function authorizeListItemWrite(baseUrl: string, apiToken: string, user: Record<string, any>, id: string) {
  const item = await fetchDirectusItem(baseUrl, apiToken, 'list_items', id, ['id', 'user_created', 'list_id'])

  if (isListsAdminUser(user) || recordMatchesListsOwnership(item, user, ['user_created'])) {
    return item
  }

  const listId = item?.list_id ? sanitizeEntityId(item.list_id, 'list') : null
  if (!listId) {
    throw createError({ statusCode: 403, statusMessage: 'List item access denied' })
  }

  await authorizeListItemParent(baseUrl, apiToken, user, listId, false)
  return item
}

function applyWebsiteOwnershipDefaults(payload: Record<string, any>, user: Record<string, any>) {
  const ownerValue = getPrimaryListsOwnerValue(user)
  const usernameValue = getPreferredListsUsername(user)

  if (payload.creator === undefined && ownerValue) {
    payload.creator = ownerValue
  }

  if (payload.username === undefined && usernameValue) {
    payload.username = usernameValue
  }

  return payload
}

async function authorizeListsObjectAccess(options: {
  baseUrl: string
  apiToken: string
  collection: string
  operation: string
  user: Record<string, any>
  itemId?: string
  payload?: Record<string, any>
}) {
  const { baseUrl, apiToken, collection, operation, user, itemId, payload } = options

  if (collection === 'websites') {
    if (operation === 'createItem' && payload) {
      applyWebsiteOwnershipDefaults(payload, user)
      return
    }

    if (!itemId) {
      return
    }

    if (operation === 'readItem') {
      await authorizeWebsiteRead(baseUrl, apiToken, user, itemId)
      return
    }

    if (operation === 'updateItem' || operation === 'deleteItem') {
      await authorizeWebsiteWrite(baseUrl, apiToken, user, itemId)
      if (payload) {
        applyWebsiteOwnershipDefaults(payload, user)
      }
    }

    return
  }

  if (collection === 'list_items') {
    if (operation === 'createItem') {
      const listReference = payload?.list_id ?? payload?.list
      if (!listReference) {
        throw createError({ statusCode: 400, statusMessage: 'list is required for list items' })
      }

      const listId = resolveRelationId(listReference, 'list')
      await authorizeListItemParent(baseUrl, apiToken, user, listId, false)

      if (payload) {
        delete payload.user_created
        delete payload.user_updated
      }

      return
    }

    if (operation === 'readItems') {
      const listFilterValue = (payload as any)?.filter?.list?._eq ?? (payload as any)?.filter?.list_id?._eq
      if (listFilterValue !== undefined && listFilterValue !== null && listFilterValue !== '') {
        const listId = resolveRelationId(listFilterValue, 'list')
        await authorizeListItemParent(baseUrl, apiToken, user, listId, true)
      }
      return
    }

    if (!itemId) {
      return
    }

    if (operation === 'readItem') {
      await authorizeListItemRead(baseUrl, apiToken, user, itemId)
      return
    }

    if (operation === 'updateItem' || operation === 'deleteItem') {
      await authorizeListItemWrite(baseUrl, apiToken, user, itemId)

      const nextListReference = payload?.list_id ?? payload?.list
      if (nextListReference !== undefined && nextListReference !== null && nextListReference !== '') {
        const listId = resolveRelationId(nextListReference, 'list')
        await authorizeListItemParent(baseUrl, apiToken, user, listId, false)
      }

      if (payload) {
        delete payload.user_created
        delete payload.user_updated
      }
    }
  }
}

export default defineEventHandler(async (event) => {
  try {
    const { url, apiToken } = getListsContentConfig(event)
    const body = validateListsContentBody(await readBody<Record<string, any>>(event))
    const operation = sanitizeOperation(body?.operation)
    const collection = sanitizeCollectionName(body?.collection)
    const requiresWriteUser = WRITE_OPERATIONS.has(operation)
    const needsOptionalUser = (operation === 'readItem' && (collection === 'websites' || collection === 'list_items')) || (operation === 'readItems' && collection === 'list_items')
    const user = requiresWriteUser
      ? await requireListsUserAccess(event)
      : needsOptionalUser
        ? await getOptionalListsUserAccess(event)
        : null

    let upstreamUrl = ''
    let method = 'GET'
    let payload: Record<string, any> | undefined
    const sanitizedOpts = sanitizeStructuredValue(body?.opts) as Record<string, unknown> | undefined
    const sanitizedId = body?.id === undefined ? undefined : sanitizeEntityId(body?.id)

    switch (operation) {
      case 'readItems':
        assertListsReadableCollection(collection)
        if (user) {
          await authorizeListsObjectAccess({
            baseUrl: url,
            apiToken,
            collection,
            operation,
            user,
            payload: sanitizedOpts as Record<string, any> | undefined,
          })
        }
        upstreamUrl = buildDirectusUrl(url, `/items/${collection}`, sanitizedOpts)
        break
      case 'readItem':
        assertListsReadableCollection(collection)
        if (user && sanitizedId) {
          await authorizeListsObjectAccess({
            baseUrl: url,
            apiToken,
            collection,
            operation,
            user,
            itemId: sanitizedId,
          })
        }
        upstreamUrl = buildDirectusUrl(url, `/items/${collection}/${sanitizedId}`, sanitizedOpts)
        break
      case 'readFieldsByCollection':
        assertListsFieldReadableCollection(collection)
        upstreamUrl = buildDirectusUrl(url, `/fields/${collection}`, sanitizedOpts)
        break
      case 'createItem':
        assertListsMutableCollection(collection)
        if (collection === 'files') {
          throw createMeeoviHttpError(400, 'Use the files upload endpoint for file uploads')
        }

        method = 'POST'
        upstreamUrl = `${url}/items/${collection}`
        payload = sanitizeStructuredValue(body?.data) as Record<string, any>
        if (user) {
          await authorizeListsObjectAccess({
            baseUrl: url,
            apiToken,
            collection,
            operation,
            user,
            payload,
          })
        }
        break
      case 'updateItem':
        assertListsMutableCollection(collection)
        method = 'PATCH'
        upstreamUrl = `${url}/items/${collection}/${sanitizedId}`
        payload = sanitizeStructuredValue(body?.data) as Record<string, any>
        if (user && sanitizedId) {
          await authorizeListsObjectAccess({
            baseUrl: url,
            apiToken,
            collection,
            operation,
            user,
            itemId: sanitizedId,
            payload,
          })
        }
        break
      case 'deleteItem':
        assertListsMutableCollection(collection)
        method = 'DELETE'
        if (user && sanitizedId) {
          await authorizeListsObjectAccess({
            baseUrl: url,
            apiToken,
            collection,
            operation,
            user,
            itemId: sanitizedId,
          })
        }
        upstreamUrl = `${url}/items/${collection}/${sanitizedId}`
        break
      default:
        throw createMeeoviHttpError(400, `Unsupported content operation: ${operation}`)
    }

    const response = await fetchDirectusWithTimeout(upstreamUrl, apiToken, {
      method,
      payload,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw createMeeoviHttpError(response.status, 'Lists content request failed')
    }

    return data
  } catch (error: any) {
    const statusCode = Number(error?.statusCode || 500)
    const statusMessage = statusCode >= 500 ? 'Lists content request failed' : String(error?.statusMessage || 'Lists content request failed')

    if (statusCode >= 500) {
      console.error('[lists][content.post] request failed', {
        statusCode,
        statusMessage: error?.statusMessage,
        message: error?.message,
      })
    }

    throw createMeeoviHttpError(statusCode, statusMessage)
  }
})