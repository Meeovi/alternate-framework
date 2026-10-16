import { createError, defineEventHandler, readBody } from 'h3'
import { ID, requireSeller } from '../utils/context'
import { importProduct, type ImportResult } from '../utils/jobs'
import { checkMarkup } from '../utils/store'
import { ownConnection, supplierFailure } from './_shared'

/** Import up to 10 supplier products (all their variants) into Magento under the seller. */
export default defineEventHandler(async (event) => {
  const seller = await requireSeller(event)
  const body = await readBody<{ connection?: unknown, productIds?: unknown, markup?: unknown }>(event).catch(() => null)
  const connection = await ownConnection(event, seller, body?.connection)
  const productIds = Array.isArray(body?.productIds) ? body.productIds.map(String) : []
  if (!productIds.length || productIds.length > 10 || !productIds.every((id) => ID.test(id))) {
    throw createError({ statusCode: 400, statusMessage: 'Choose between 1 and 10 products' })
  }
  let markup
  try {
    markup = checkMarkup(body?.markup)
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: (error as Error).message })
  }

  const results: ImportResult[] = []
  for (const productId of productIds) {
    results.push(await importProduct(connection, productId, markup, event).catch((error) => {
      if ((error as { status?: number }).status === 400) supplierFailure(error)
      return { productId, created: 0, updated: 0, skipped: [], errors: [String((error as Error).message).slice(0, 300)] }
    }))
  }
  return { results }
})
