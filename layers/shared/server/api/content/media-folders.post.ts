import { defineEventHandler, createError, readBody } from 'h3'
import { ContentAdapterRegistry } from 'alternate-sdk'

export default defineEventHandler(async (event) => {
  const adapter = ContentAdapterRegistry.getDefaultAdapter()
  if (!adapter) {
    throw createError({ statusCode: 501, statusMessage: 'No content backend is configured' })
  }

  const body = await readBody(event)
  const payload = typeof body === 'string' ? { name: body } : body
  return adapter.createMediaFolder(payload)
})
