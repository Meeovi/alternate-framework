import { createError, defineEventHandler, getRouterParam } from 'h3'
import type { PolarCheckoutStatus } from '../../runtime/types'
import { polarError, usePolar } from '../utils/polar'

/**
 * GET {apiBase}/checkout/:id — a checkout's status and product, for the
 * success page (Polar sends the buyer back with `?checkout_id=`). Public,
 * since the id travels in URLs: no buyer details are returned.
 */
export default defineEventHandler(async (event): Promise<PolarCheckoutStatus> => {
  const id = getRouterParam(event, 'id') ?? ''
  if (!/^[\w-]{1,64}$/.test(id)) throw createError({ statusCode: 400, statusMessage: 'A checkout id is required' })
  try {
    const checkout = await usePolar(event).checkouts.get({ id })
    return {
      id: checkout.id,
      status: checkout.status,
      product: checkout.product ? { name: checkout.product.name, description: checkout.product.description ?? null } : null,
    }
  } catch (error) {
    polarError(error, 'checkout lookup')
  }
})
