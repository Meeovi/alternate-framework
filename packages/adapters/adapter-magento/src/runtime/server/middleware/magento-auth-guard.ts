import { defineEventHandler, createError } from 'h3'
import { getServerAuth } from 'alternate-sdk'

export default defineEventHandler(async (event) => {
  const url = event.path || event.node.req.url || ''

  const protectedPrefixes = [
    '/api/magento/customer',
    '/api/magento/cart',
  ]

  if (!protectedPrefixes.some((p) => url.startsWith(p))) {
    return
  }

  const session = await getServerAuth(event)

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }
})
