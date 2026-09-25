import {
  defineEventHandler,
  getRouterParam,
  readBody,
  createError
} from 'h3'
import type { H3Event } from 'h3'
import { getExperiencePagesRepository } from '../../../../db/repository'
import { sanitizeGrapesJson, sanitizeRichTextProps } from '../../../../../runtime/utils/sanitize'
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
  const user = await assertCanEditEntity(event, entityType, entityId)

  /* --------------------------------------------
   * 3. Read and validate body
   * -------------------------------------------- */
  const body = await readBody<any>(event)

  if (!body?.title || !body?.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing title or data'
    })
  }

  const published = !!body.published
  const versionLabel = typeof body.versionLabel === 'string' ? body.versionLabel : null

  /* --------------------------------------------
   * 4. Load repository
   * -------------------------------------------- */
  const repo = getExperiencePagesRepository(event)

  /* --------------------------------------------
   * 5. Load existing page for versioning
   * -------------------------------------------- */
  const existing = await repo.findOne(entityType, entityId, slug)

  /* --------------------------------------------
   * 6. Sanitize incoming GrapesJS project JSON
   * -------------------------------------------- */
  const safeData = sanitizeGrapesJson(body.data)
  const sanitizedProject = sanitizeRichTextProps(safeData)

  /* --------------------------------------------
   * 7. Create version snapshot if page exists
   * -------------------------------------------- */
  if (existing) {
    await repo.createVersion({
      pageId: existing.id,
      entityType,
      entityId,
      slug,
      title: existing.title,
      data: existing.data,
      published: existing.published,
      label: versionLabel || `auto-${new Date().toISOString()}`,
      createdBy: user.id
    })
  }

  /* --------------------------------------------
   * 8. Compute next version number
   * -------------------------------------------- */
  const nextVersion = existing ? (existing.version || 0) + 1 : 1

  /* --------------------------------------------
   * 9. Upsert the page
   * -------------------------------------------- */
  const page = await repo.upsert({
    entityType,
    entityId,
    slug,
    title: body.title,
    data: sanitizedProject,
    published,
    version: nextVersion,
    updatedBy: user.id
  })

  /* --------------------------------------------
   * 10. Return updated page
   * -------------------------------------------- */
  return page
})
