import { createError, defineEventHandler, readBody } from 'h3'
import { requireCommerceAdminAccess } from '../../../../utils/admin-access'
import { CommerceAdminError, deleteProduct, sanitizeSku } from '../../../../utils/commerce-admin'

export default defineEventHandler(async (event) => {
  try {
    await requireCommerceAdminAccess(event)
    const body = await readBody<{ sku?: string }>(event)

    if (!body?.sku) {
      throw createError({ statusCode: 400, statusMessage: 'sku is required' })
    }

    return await deleteProduct(sanitizeSku(body.sku))
  } catch (error) {
    if (error instanceof CommerceAdminError) {
      const statusCode = Number(error.statusCode || 500)
      const statusMessage = statusCode >= 500 ? 'Commerce admin product delete failed' : error.message
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