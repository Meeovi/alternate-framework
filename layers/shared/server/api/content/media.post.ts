import { defineEventHandler, createError, readFormData } from 'h3'
import { ContentAdapterRegistry } from 'alternate-sdk'

export default defineEventHandler(async (event) => {
  const adapter = ContentAdapterRegistry.getDefaultAdapter()
  if (!adapter) {
    throw createError({ statusCode: 501, statusMessage: 'No content backend is configured' })
  }

  const formData = await readFormData(event)
  return adapter.uploadMedia(formData)
})
