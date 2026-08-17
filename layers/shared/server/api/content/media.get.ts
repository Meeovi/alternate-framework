import { defineEventHandler, createError, getQuery } from 'h3'
import { ContentAdapterRegistry } from 'alternate-sdk'

// Backend-agnostic — routes to whichever adapter (Directus, Magento,
// Vendure, ...) registered itself into ContentAdapterRegistry, so
// useMediaCenter.ts never imports a specific backend's SDK.
export default defineEventHandler(async (event) => {
  const adapter = ContentAdapterRegistry.getDefaultAdapter()
  if (!adapter) {
    throw createError({ statusCode: 501, statusMessage: 'No content backend is configured' })
  }

  const query = getQuery(event)
  const sort = typeof query.sort === 'string' ? query.sort.split(',') : undefined

  return adapter.listMedia({ sort })
})
