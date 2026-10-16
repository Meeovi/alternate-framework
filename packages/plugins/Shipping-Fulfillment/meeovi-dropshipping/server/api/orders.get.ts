import { defineEventHandler } from 'h3'
import { requireSeller } from '../utils/context'
import { store, toOrder } from '../utils/store'

export default defineEventHandler(async (event) => {
  const seller = await requireSeller(event)
  return (await store(event).orders.forUser(seller.id)).map(toOrder)
})
