import { getQuery } from 'h3'
import { productsForRefs, purchasedRefs, readLimit, recentPaidOrders } from '../../../utils/purchasedProducts'

/**
 * GET /api/commerce/purchases/recent?limit=12 — products people bought
 * recently, newest first. Products only: never who bought them, when, or how
 * many. Cached for 5 minutes per limit.
 */
export default defineCachedEventHandler(async (event) => {
  const limit = readLimit(getQuery(event).limit)
  const products = await productsForRefs(purchasedRefs(await recentPaidOrders()), limit)
  return { products }
}, {
  maxAge: 300,
  name: 'commerce-recent-purchases',
  getKey: (event) => String(readLimit(getQuery(event).limit)),
})
