import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { requireSeller } from '../utils/context'
import { store, toConnection } from '../utils/store'
import { ownConnection } from './_shared'

/** Settings: whether forwarded orders are confirmed (paid) automatically — Printful only. */
export default defineEventHandler(async (event) => {
  const seller = await requireSeller(event)
  const connection = await ownConnection(event, seller, getRouterParam(event, 'id'))
  const body = await readBody<{ autoConfirmOrders?: unknown }>(event).catch(() => null)
  const row = await store(event).connections.update(connection.id, {
    auto_confirm_orders: connection.provider === 'printful' && body?.autoConfirmOrders === true,
  })
  return toConnection(row)
})
