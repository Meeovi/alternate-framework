import { defineEventHandler, getRouterParam, createError } from 'h3'
import { getExperiencePagesRepository } from '../../../../db/repository'

export default defineEventHandler(async (event) => {
  const entityType = getRouterParam(event, 'entityType')
  const entityId = getRouterParam(event, 'entityId')
  const slug = getRouterParam(event, 'slug')

  if (!entityType || !entityId || !slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing entityType, entityId, or slug'
    })
  }

  const repo = getExperiencePagesRepository(event)

  // FIX: pass all 3 arguments
  const page = await repo.findOne(entityType, entityId, slug)

  if (!page) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page not found'
    })
  }

  return page
})
