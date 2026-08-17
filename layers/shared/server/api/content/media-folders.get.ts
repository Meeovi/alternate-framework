import { defineEventHandler, createError } from 'h3'
import { ContentAdapterRegistry } from 'alternate-sdk'

export default defineEventHandler(async () => {
  const adapter = ContentAdapterRegistry.getDefaultAdapter()
  if (!adapter) {
    throw createError({ statusCode: 501, statusMessage: 'No content backend is configured' })
  }

  return adapter.listMediaFolders()
})
