import { defineEventHandler } from 'h3'
import { requireSeller } from '../utils/context'
import { store, toConnection } from '../utils/store'

export default defineEventHandler(async (event) => {
  const seller = await requireSeller(event)
  const rows = await store(event).connections.forUser(seller.id)
  return rows.filter((r) => r.status !== 'disconnected').map(toConnection)
})
