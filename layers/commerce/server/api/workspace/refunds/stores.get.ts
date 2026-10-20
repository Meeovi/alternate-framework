import { defineEventHandler } from 'h3'
import { requireAdmin } from '#auth/server/utils/sessions'
import { refundBackends } from '../../../utils/storeAdmin'

/** GET /api/workspace/refunds/stores — stores whose orders admins can refund here. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return { stores: refundBackends().map((b) => ({ id: b.id, label: b.id.charAt(0).toUpperCase() + b.id.slice(1) })) }
})
