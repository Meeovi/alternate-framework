import { defineEventHandler, getRouterParam } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { removeConnection } from '../../../../utils/federation-connections'

/**
 * DELETE /api/social/federation/connections/:network — disconnect: the
 * stored credentials are deleted (works even when the plugin has since been
 * removed).
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) as { id: string }
  const network = String(getRouterParam(event, 'network') || '').toLowerCase()
  return { removed: /^[a-z][a-z0-9_-]{1,31}$/.test(network) ? await removeConnection(user.id, network) : false }
})
