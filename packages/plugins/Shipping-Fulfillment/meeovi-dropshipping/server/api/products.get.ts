import { defineEventHandler } from 'h3'
import { requireSeller } from '../utils/context'
import { store, toProduct } from '../utils/store'

export default defineEventHandler(async (event) => {
  const seller = await requireSeller(event)
  return (await store(event).products.forUser(seller.id)).map(toProduct)
})
