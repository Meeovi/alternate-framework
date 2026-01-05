import { defineEventHandler, readBody } from 'h3'
import { useMagentoServer } from '../../../utils/useMagentoServer'

export default defineEventHandler(async (event) => {
  const magento = useMagentoServer(event)
  const body = await readBody(event)

  const { cartId, sku, qty } = body

  return magento.cart.addItem(cartId, {
    quote_id: cartId,
    sku,
    qty
  })
})
