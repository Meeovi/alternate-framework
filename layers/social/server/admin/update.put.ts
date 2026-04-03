import { createError, defineEventHandler, readBody } from 'h3'
import { requireListsAdminAccess, sanitizeListsAdminUpdateInput } from '../../../utils/access'

const LISTS_ADMIN_TIMEOUT_MS = 10_000

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event) as any
  const wordpressUrl = config.listsApi?.wordpressUrl
  const wordpressToken = config.listsApi?.wordpressToken

  if (!wordpressUrl || !wordpressToken) {
    throw createError({ statusCode: 500, statusMessage: 'Lists WordPress admin API is not configured' })
  }

  await requireListsAdminAccess(event)

  const body = sanitizeListsAdminUpdateInput(await readBody<Record<string, any>>(event))
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), LISTS_ADMIN_TIMEOUT_MS)
  let response: Response

  try {
    response = await fetch(`${wordpressUrl.replace(/\/$/, '')}/wp-json/wp/v2/list`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${wordpressToken}`,
      },
      body: JSON.stringify({
        title: body?.title,
        ispublic: body?.ispublic,
        description: body?.description,
        image: body?.image,
        type: body?.type,
        products: body?.products,
        owner: body?.owner,
        status: body?.status || 'publish',
      }),
      signal: controller.signal,
    })
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw createError({ statusCode: 504, statusMessage: 'Failed to update list: upstream timed out' })
    }

    throw createError({ statusCode: 502, statusMessage: 'Failed to update list' })
  } finally {
    clearTimeout(timeout)
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: 'Failed to update list',
    })
  }

  return data
})