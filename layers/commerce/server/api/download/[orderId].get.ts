// server/api/download/[orderId].get.ts
//
// file_id/download_token/download_expires_at/fulfillment_status are
// populated by server/utils/paidCheckout.ts when a paid order contains a
// product with a file attached.
import { readItem } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'
import { getDirectusFacade } from '../../utils/directusClient'

export default defineEventHandler(async (event) => {
  // 1. Validate the user session via Better Auth
  const user = await requireAuth(event)

  const orderId = getRouterParam(event, 'orderId')
  if (!orderId) {
    throw createError({ statusCode: 400, message: 'Missing orderId' })
  }

  // A privileged, static-token client is required here — the order lookup
  // must be authoritative regardless of the requesting user's own Directus
  // permissions, since the whole point of this endpoint is to check
  // ownership *before* trusting anything the caller claims.
  const directus = getDirectusFacade()

  // 2. Fetch the order record to verify ownership and status
  // Directus answers a nonexistent id with 403 "You don't have permission",
  // not 404 — treat any lookup failure as "not found" instead of a 500.
  const order = await directus.request(
    readItem('orders', orderId, {
      fields: ['id', 'buyer_id', 'fulfillment_status', 'file_id', 'download_token', 'download_expires_at'],
    }),
  ).catch(() => null)

  if (!order) {
    throw createError({ statusCode: 404, message: 'Order not found' })
  }

  if (!order.buyer_id || order.buyer_id !== user.id) {
    throw createError({ statusCode: 403, message: 'Access denied to this asset.' })
  }

  if (order.fulfillment_status !== 'delivered') {
    throw createError({ statusCode: 403, message: 'Order not yet fulfilled.' })
  }

  // 3. Validate time-limited download token if present
  if (order.download_token && order.download_expires_at) {
    const token = getQuery(event).token as string | undefined
    if (!token || token !== order.download_token) {
      throw createError({ statusCode: 403, message: 'Invalid or missing download token.' })
    }
    if (new Date(order.download_expires_at) < new Date()) {
      throw createError({ statusCode: 403, message: 'Download link expired.' })
    }
  }

  if (!order.file_id) {
    throw createError({ statusCode: 404, message: 'Asset file not attached to order.' })
  }

  // 4. Stream the asset from Directus private storage
  const assetUrl = `${process.env.DIRECTUS_URL}/assets/${order.file_id}`
  const fileStream = await $fetch.raw(assetUrl, {
    headers: { Authorization: `Bearer ${process.env.NUXTUS_DIRECTUS_STATIC_TOKEN}` },
    responseType: 'stream',
  })

  // 5. Set safe download headers
  setHeader(event, 'Content-Disposition', `attachment; filename="download-${orderId}"`)
  setHeader(event, 'Cache-Control', 'private, no-store')

  return sendStream(event, fileStream as any)
})
