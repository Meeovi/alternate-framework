import { defineEventHandler, createError, readBody } from 'h3'
import { ContentAdapterRegistry } from 'alternate-sdk'
import { requireAuth } from '#auth/server/utils/sessions'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const adapter = ContentAdapterRegistry.getDefaultAdapter()
  if (!adapter) {
    throw createError({ statusCode: 501, statusMessage: 'No content backend is configured' })
  }

  const body = await readBody(event)
  const payload = typeof body === 'string' ? { name: body } : body
  return adapter.createMediaFolder(payload)
})
