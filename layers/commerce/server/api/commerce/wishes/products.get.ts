import { defineEventHandler } from 'h3'
import { giftCardProducts } from '../../../utils/giftCards'

/**
 * GET /api/commerce/wishes/products — gift card products ("wishes") from
 * every commerce backend that sells them.
 */
export default defineEventHandler(async () => {
  return { products: await giftCardProducts() }
})
