import { defineEventHandler, getRouterParam } from 'h3'
import { requireSeller } from '../utils/context'
import { store } from '../utils/store'
import { ownConnection } from './_shared'

/**
 * Disconnect: credentials are wiped and syncing stops. Imported products
 * stay in Magento (the seller can disable or delete them there); their
 * stock is no longer updated.
 */
export default defineEventHandler(async (event) => {
  const seller = await requireSeller(event)
  const connection = await ownConnection(event, seller, getRouterParam(event, 'id'))
  await store(event).connections.update(connection.id, { status: 'disconnected', credentials: '' })
  return { ok: true }
})
