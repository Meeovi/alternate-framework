import { defineEventHandler, setResponseHeader } from 'h3'
import type { PolarProductSummary } from '../../runtime/types'
import { polarConfig, polarError, usePolar } from '../utils/polar'

/**
 * GET {apiBase}/products — the organization's products that aren't
 * archived (only the configured ones, when `products` is set), with their
 * prices. Public.
 */
export default defineEventHandler(async (event): Promise<PolarProductSummary[]> => {
  const allowed = new Set(Object.values(polarConfig(event).products))
  const items: PolarProductSummary[] = []
  try {
    const pages = await usePolar(event).products.list({ isArchived: false, limit: 100 })
    for await (const page of pages) {
      for (const product of page.result.items) {
        if (allowed.size && !allowed.has(product.id)) continue
        items.push({
          id: product.id,
          name: product.name,
          description: product.description ?? null,
          isRecurring: product.isRecurring,
          prices: product.prices.map((price: Record<string, any>) => ({
            id: String(price.id),
            amountType: String(price.amountType ?? 'fixed'),
            priceAmount: typeof price.priceAmount === 'number' ? price.priceAmount : null,
            priceCurrency: price.priceCurrency ?? null,
            recurringInterval: price.recurringInterval ?? (product as Record<string, any>).recurringInterval ?? null,
          })),
        })
      }
    }
  } catch (error) {
    polarError(error, 'product list')
  }
  setResponseHeader(event, 'cache-control', 'public, max-age=60')
  return items
})
