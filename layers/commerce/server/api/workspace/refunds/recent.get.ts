import { defineEventHandler, getQuery } from 'h3'
import { requireAdmin } from '#auth/server/utils/sessions'
import { refundBackend, storeError } from '../../../utils/storeAdmin'

/** GET /api/workspace/refunds/recent?store=magento — the store's newest orders (25). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const backend = refundBackend(String(getQuery(event).store || 'magento'))
  const rows = await backend.request({ method: 'GET', collection: 'orders' }).catch((e) => storeError(e, 'list orders'))
  return { orders: (Array.isArray(rows) ? rows : []).slice(0, 25) }
})
