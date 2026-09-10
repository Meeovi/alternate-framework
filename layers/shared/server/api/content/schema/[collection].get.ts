import { defineEventHandler, createError, getRouterParam } from 'h3'
import { ContentAdapterRegistry } from 'alternate-sdk'
import { requireAuth } from '#auth/server/utils/sessions'

// Directus/Magento/... system collections. Their field definitions
// (column names, types, FK targets) are not something an app user should
// be able to introspect through the generic CMS schema route.
const BLOCKED_COLLECTION = /^(directus_|_|os_|stripe_|auth_|users$|accounts$|sessions$)/i

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const adapter = ContentAdapterRegistry.getDefaultAdapter()
  if (!adapter) {
    throw createError({ statusCode: 501, statusMessage: 'No content backend is configured' })
  }

  const collection = getRouterParam(event, 'collection')
  if (!collection) {
    throw createError({ statusCode: 400, statusMessage: 'Missing collection' })
  }
  if (BLOCKED_COLLECTION.test(collection)) {
    throw createError({ statusCode: 403, statusMessage: 'Schema for this collection is not available' })
  }

  return adapter.getCollectionSchema(collection)
})
