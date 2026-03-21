import { createError, defineEventHandler, getHeader, readRawBody } from 'h3'
import { requireListsUserAccess } from '../../../utils/access'
import { getListsContentConfig } from '../../../utils/lists-content'

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024
const LISTS_UPLOAD_TIMEOUT_MS = 10_000

export default defineEventHandler(async (event) => {
  await requireListsUserAccess(event)
  const { url, apiToken } = getListsContentConfig(event)
  const contentType = getHeader(event, 'content-type')

  if (!contentType || !contentType.toLowerCase().includes('multipart/form-data')) {
    throw createError({ statusCode: 400, statusMessage: 'Expected multipart/form-data body' })
  }

  const rawBody = await readRawBody(event, false)
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Upload body is empty' })
  }

  const bodySize = typeof rawBody === 'string' ? Buffer.byteLength(rawBody) : rawBody.length

  if (bodySize > MAX_UPLOAD_SIZE_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Upload body exceeds the allowed size' })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), LISTS_UPLOAD_TIMEOUT_MS)
  let response: Response

  try {
    response = await fetch(`${url}/files`, {
      method: 'POST',
      headers: {
        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
        'Content-Type': contentType,
      },
      body: rawBody,
      signal: controller.signal,
    })
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw createError({ statusCode: 504, statusMessage: 'File upload timed out' })
    }

    throw createError({ statusCode: 502, statusMessage: 'Failed to upload file' })
  } finally {
    clearTimeout(timeout)
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: 'Failed to upload file',
    })
  }

  return data?.data ?? data
})