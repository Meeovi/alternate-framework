import { defineEventHandler, getRouterParam } from 'h3'
import { useMagentoServer } from '../../../utils/useMagentoServer'

export default defineEventHandler(async (event) => {
  const magento = useMagentoServer(event)
  const sku = getRouterParam(event, 'sku') as string
  return magento.products.getBySku(sku)
})
