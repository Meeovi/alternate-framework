import { CommerceBackendRegistry } from 'alternate-sdk'
import { resolveProductForCart } from './cart'
import { backendCustomerId } from './productRef'
import { getRate } from './shippo'
import { dollarsToCents } from './currency'

export interface PricedLine {
  /** The product key the webhook/fulfilment links back to: the Directus id
   *  or `<backend>:<key>` (see productRef.ts). */
  ref: string
  name: string
  quantity: number
  unitCents: number
  backend: string | null
  requiresShipping: boolean
}

export interface PricedCart {
  lines: PricedLine[]
  itemCents: number
  shipping: { rateId: string, cents: number, name: string, days: number | null } | null
  currency: string
  /** Lines another commerce backend owns are recorded there at its own
   *  price, so the payment must match it exactly (no discounts or tax). */
  hasBackendLines: boolean
}

/**
 * Prices a checkout from the server's own sources — every product from the
 * catalogue it lives in, the shipping rate re-fetched from Shippo by id —
 * so nothing the client sends can change what is charged.
 *
 * Refuses (HTTP errors) carts that couldn't be fulfilled once paid: an
 * unknown product, or a commerce-backend line the buyer can't be recorded
 * for (signed out, or no customer account there).
 */
export async function priceCart(input: {
  items: { id: string, quantity: number }[]
  shippoRateId?: string
  currency?: string
  buyer?: Record<string, any> | null
}): Promise<PricedCart> {
  const currency = (input.currency || 'usd').toLowerCase()
  let hasBackendLines = false

  const lines = await Promise.all(input.items.map(async (item): Promise<PricedLine> => {
    const product = await resolveProductForCart(String(item.id))
    if (!product) {
      throw createError({ statusCode: 400, statusMessage: `Unknown or unpriced product: ${item.id}` })
    }
    if (product.backend) {
      hasBackendLines = true
      const backend = CommerceBackendRegistry.get(product.backend)
      if (typeof backend?.placePaidOrder !== 'function') {
        throw createError({ statusCode: 409, statusMessage: `${product.name} can't be bought here right now.` })
      }
      if (!input.buyer?.id) {
        throw createError({ statusCode: 401, statusMessage: `Sign in to buy ${product.name}.` })
      }
      if (!backendCustomerId(product.backend, input.buyer)) {
        throw createError({
          statusCode: 409,
          statusMessage: `Your account isn't linked to the store yet, so ${product.name} can't be bought. Please contact support.`,
        })
      }
    }
    return {
      ref: product.id,
      name: product.name || String(item.id),
      quantity: item.quantity,
      unitCents: dollarsToCents(product.price),
      backend: product.backend,
      requiresShipping: product.requiresShipping,
    }
  }))

  let shipping: PricedCart['shipping'] = null
  if (input.shippoRateId) {
    const rate = await getRate(input.shippoRateId).catch(() => null)
    const amount = Number(rate?.amount)
    if (!rate || !Number.isFinite(amount)) {
      throw createError({ statusCode: 400, statusMessage: 'Unknown or expired shipping rate' })
    }
    if ((rate.currency || currency).toLowerCase() !== currency) {
      throw createError({ statusCode: 400, statusMessage: 'The shipping rate is in another currency' })
    }
    const service = (rate as any).servicelevel?.name || (rate as any).servicelevel_name || ''
    shipping = {
      rateId: input.shippoRateId,
      cents: dollarsToCents(amount),
      name: `${rate.provider} ${service}`.trim(),
      days: rate.estimated_days ?? null,
    }
  } else if (lines.some((line) => line.requiresShipping)) {
    throw createError({ statusCode: 400, statusMessage: 'Choose a shipping method first' })
  }

  return {
    lines,
    itemCents: lines.reduce((sum, line) => sum + line.unitCents * line.quantity, 0),
    shipping,
    currency,
    hasBackendLines,
  }
}
