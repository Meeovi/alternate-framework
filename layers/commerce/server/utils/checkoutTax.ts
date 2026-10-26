import { CommerceBackendRegistry, type CommerceBackendAdapter, type TaxQuote, type TaxQuoteRequest } from 'alternate-sdk'
import { backendCustomerId, parseProductRef } from './productRef'
import { centsToDollars, dollarsToCents } from './currency'
import type { PricedLine } from './checkoutCart'

/** Where the goods go, as /checkout collects it. */
export interface CheckoutAddress {
  street1?: string
  street2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export interface CartTax {
  taxCents: number
  /** The tax on each backend's own lines, by backend id: what its
   *  placePaidOrder() expects on top of their price (backendOrders.ts). */
  backendTaxCents: Record<string, number>
}

/**
 * Tax for a checkout, from the commerce backend plugged into Directus — the
 * app works out no tax itself.
 *
 * A backend's own products are quoted in the same quote its
 * placePaidOrder() builds, so the payment matches what it records. Lines
 * priced in Directus, and shipping, are quoted by the first backend that can
 * quote tax. With no such backend nothing is added.
 *
 * Refuses (HTTP errors) when the backend can't be reached — the buyer isn't
 * charged without the tax — or when its price for its own lines no longer
 * matches the app's, since the payment then wouldn't match the order.
 */
export async function quoteCartTax(input: {
  lines: PricedLine[]
  shippingCents: number
  currency: string
  buyer?: Record<string, any> | null
  address?: CheckoutAddress | null
}): Promise<CartTax> {
  const address = toBackendAddress(input.address)
  const byBackend = new Map<string, { backend: CommerceBackendAdapter, items: { key: string, qty: number }[], cents: number }>()
  const otherLines: TaxQuoteRequest['otherLines'] = []
  for (const line of input.lines) {
    const parsed = line.backend ? parseProductRef(line.ref) : null
    if (parsed?.kind === 'backend') {
      const group = byBackend.get(parsed.backend.id) ?? { backend: parsed.backend, items: [], cents: 0 }
      group.items.push({ key: parsed.key, qty: line.quantity })
      group.cents += line.unitCents * line.quantity
      byBackend.set(parsed.backend.id, group)
    } else {
      otherLines.push({ reference: line.ref, price: centsToDollars(line.unitCents), qty: line.quantity })
    }
  }

  const result: CartTax = { taxCents: 0, backendTaxCents: {} }
  const quotes: Promise<void>[] = []

  for (const [backendId, group] of byBackend) {
    if (typeof group.backend.quoteTax !== 'function') continue
    quotes.push(quote(group.backend, {
      currency: input.currency,
      customerId: backendCustomerId(backendId, input.buyer) ?? undefined,
      items: group.items,
      otherLines: [],
      ...(address && { address }),
    }).then((answer) => {
      const items = answer.items
      // Charge the backend's total for its lines, so the order it records
      // matches the payment; refuse if it no longer agrees with our price.
      const totalCents = items ? dollarsToCents(items.grandTotal) : group.cents
      const taxCents = totalCents - group.cents
      const priceChanged = !items || items.discount !== 0 || taxCents < 0
        || (!answer.pricesIncludeTax && dollarsToCents(items.subtotal) !== group.cents)
      if (priceChanged) {
        throw createError({ statusCode: 409, statusMessage: 'Some prices in your cart have changed. Please refresh your cart and try again.' })
      }
      result.backendTaxCents[backendId] = taxCents
      result.taxCents += taxCents
    }))
  }

  if (otherLines.length || input.shippingCents > 0) {
    const taxBackend = CommerceBackendRegistry.list().find((backend) => backend.isEnabled() && typeof backend.quoteTax === 'function')
    if (taxBackend) {
      quotes.push(quote(taxBackend, {
        currency: input.currency,
        customerId: backendCustomerId(taxBackend.id, input.buyer) ?? undefined,
        items: [],
        otherLines,
        shippingAmount: centsToDollars(input.shippingCents),
        ...(address && { address }),
      }).then((answer) => {
        result.taxCents += dollarsToCents(answer.otherTax) + dollarsToCents(answer.shippingTax)
      }))
    }
  }

  await Promise.all(quotes)
  return result
}

async function quote(backend: CommerceBackendAdapter, request: TaxQuoteRequest): Promise<TaxQuote> {
  try {
    return await backend.quoteTax!(request)
  } catch (error) {
    console.error(`[checkout] ${backend.id} tax quote failed:`, (error as Error)?.message ?? error)
    throw createError({ statusCode: 502, statusMessage: "We couldn't work out the tax on your order. Please try again." })
  }
}

function toBackendAddress(address?: CheckoutAddress | null): TaxQuoteRequest['address'] | null {
  const country = address?.country?.trim().toUpperCase()
  if (!country || country.length !== 2) return null
  const street = [address?.street1, address?.street2].map((line) => line?.trim()).filter((line): line is string => !!line)
  return {
    country_id: country,
    ...(address?.state?.trim() && { region_code: address.state.trim() }),
    ...(address?.zip?.trim() && { postcode: address.zip.trim() }),
    ...(address?.city?.trim() && { city: address.city.trim() }),
    ...(street.length && { street }),
  }
}
