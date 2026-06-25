import { defineEventHandler, getRouterParam, createError } from 'h3'
import type { H3Event } from 'h3'
import { getExperiencePagesRepository } from '../../../../db/repository'
import { assertCanEditEntity } from '../../../../policies/permissions'

export default defineEventHandler(async (event: H3Event) => {
  /* --------------------------------------------
   * 1. Extract route params
   * -------------------------------------------- */
  const entityType = getRouterParam(event, 'entityType')
  const entityId = getRouterParam(event, 'entityId')
  const slug = getRouterParam(event, 'slug')

  if (!entityType || !entityId || !slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing entityType, entityId, or slug'
    })
  }

  /* --------------------------------------------
   * 2. Permission check
   * -------------------------------------------- */
  await assertCanEditEntity(event, entityType, entityId)

  /* --------------------------------------------
   * 3. Load repository
   * -------------------------------------------- */
  const repo = getExperiencePagesRepository(event)

  /* --------------------------------------------
   * 4. Load existing page
   * -------------------------------------------- */
  const existing = await repo.findOne(entityType, entityId, slug)

  if (!existing) {
    // Returning null is fine — DELETE is idempotent
    return { deleted: false, reason: 'Page not found' }
  }

  /* --------------------------------------------
   * 5. Delete page + all versions
   * -------------------------------------------- */
  await repo.delete(existing.id)

  return {
    deleted: true,
    id: existing.id,
    entityType,
    entityId,
    slug
  }
})
