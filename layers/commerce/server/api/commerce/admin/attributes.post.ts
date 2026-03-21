import { createError, defineEventHandler, readBody } from 'h3'
import { requireCommerceAdminAccess } from '../../../utils/admin-access'
import { CommerceAdminError, executeWordpressRest } from '../../../utils/commerce-admin'

const ATTRIBUTE_NAME_PATTERN = /^[A-Za-z0-9 _-]{1,255}$/
const ATTRIBUTE_SLUG_PATTERN = /^[a-z0-9_-]{1,64}$/
const ATTRIBUTE_TYPE_PATTERN = /^(select|text|multiselect|swatch_text|swatch_visual)$/

function sanitizeAttributeName(value: unknown) {
  const name = String(value || '').trim()

  if (!ATTRIBUTE_NAME_PATTERN.test(name)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid attribute name provided' })
  }

  return name
}

function sanitizeAttributeSlug(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return ''
  }

  const slug = String(value).trim().toLowerCase()

  if (!ATTRIBUTE_SLUG_PATTERN.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid attribute slug provided' })
  }

  return slug
}

function sanitizeAttributeType(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return 'select'
  }

  const type = String(value).trim().toLowerCase()

  if (!ATTRIBUTE_TYPE_PATTERN.test(type)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid attribute type provided' })
  }

  return type
}

export default defineEventHandler(async (event) => {
  try {
    await requireCommerceAdminAccess(event)
    const body = await readBody<Record<string, any>>(event)

    return await executeWordpressRest('/wp-json/dokan/v1/products/attributes', {
      name: sanitizeAttributeName(body?.name),
      slug: sanitizeAttributeSlug(body?.slug),
      type: sanitizeAttributeType(body?.type),
      status: 'publish',
    })
  } catch (error) {
    if (error instanceof CommerceAdminError) {
      const statusCode = Number(error.statusCode || 500)
      const statusMessage = statusCode >= 500 ? 'Commerce admin attribute request failed' : error.message
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