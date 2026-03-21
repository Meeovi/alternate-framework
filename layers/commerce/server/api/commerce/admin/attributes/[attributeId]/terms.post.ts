import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { requireCommerceAdminAccess } from '../../../../../utils/admin-access'
import { CommerceAdminError, executeWordpressRest } from '../../../../../utils/commerce-admin'

const ATTRIBUTE_ID_PATTERN = /^\d{1,10}$/
const ATTRIBUTE_NAME_PATTERN = /^[A-Za-z0-9 _-]{1,255}$/
const ATTRIBUTE_SLUG_PATTERN = /^[a-z0-9_-]{1,64}$/
const ATTRIBUTE_TYPE_PATTERN = /^(select|text|multiselect|swatch_text|swatch_visual)$/

function sanitizeAttributeId(value: unknown) {
  const attributeId = String(value || '').trim()

  if (!ATTRIBUTE_ID_PATTERN.test(attributeId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid attributeId provided' })
  }

  return attributeId
}

function sanitizeName(value: unknown) {
  const name = String(value || '').trim()

  if (!ATTRIBUTE_NAME_PATTERN.test(name)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid name provided' })
  }

  return name
}

function sanitizeSlug(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return ''
  }

  const slug = String(value).trim().toLowerCase()

  if (!ATTRIBUTE_SLUG_PATTERN.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid slug provided' })
  }

  return slug
}

function sanitizeType(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return 'select'
  }

  const type = String(value).trim().toLowerCase()

  if (!ATTRIBUTE_TYPE_PATTERN.test(type)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid type provided' })
  }

  return type
}

function sanitizeDescription(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return ''
  }

  return String(value).trim().slice(0, 2000)
}

export default defineEventHandler(async (event) => {
  try {
    await requireCommerceAdminAccess(event)
    const attributeId = sanitizeAttributeId(getRouterParam(event, 'attributeId'))
    const body = await readBody<Record<string, any>>(event)

    return await executeWordpressRest(`/wp-json/dokan/v1/products/attributes/${encodeURIComponent(attributeId)}/terms`, {
      name: sanitizeName(body?.name),
      slug: sanitizeSlug(body?.slug),
      type: sanitizeType(body?.type),
      description: sanitizeDescription(body?.description),
      status: 'publish',
    })
  } catch (error) {
    if (error instanceof CommerceAdminError) {
      const statusCode = Number(error.statusCode || 500)
      const statusMessage = statusCode >= 500 ? 'Commerce admin attribute term request failed' : error.message
      throw createError({
        statusCode,
        statusMessage,
        data: {
          code: statusCode >= 500 ? 'UNKNOWN' : 'BAD_REQUEST',
          message: statusMessage,
        },
      })
    }

    throw error
  }
})