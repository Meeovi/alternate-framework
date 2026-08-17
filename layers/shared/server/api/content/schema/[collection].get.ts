import { defineEventHandler, createError, getRouterParam } from 'h3'
import { ContentAdapterRegistry } from 'alternate-sdk'

export default defineEventHandler(async (event) => {
  const adapter = ContentAdapterRegistry.getDefaultAdapter()
  if (!adapter) {
    throw createError({ statusCode: 501, statusMessage: 'No content backend is configured' })
  }

  const collection = getRouterParam(event, 'collection')
  if (!collection) {
    throw createError({ statusCode: 400, statusMessage: 'Missing collection' })
  }

  return adapter.getCollectionSchema(collection)
})
