import { defineEventHandler } from 'h3'
import { getAuth } from 'alternate-auth/runtime/server' // adjust to your server helper

export default defineEventHandler(async (event) => {
  const url = event.path || event.node.req.url || ''

  const protectedPrefixes = [
    '/api/magento/customer',
    '/api/magento/cart',
  ]

  if (!protectedPrefixes.some((p) => url.startsWith(p))) {
    return
  }

  const session = await getAuth(event)

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }
})
