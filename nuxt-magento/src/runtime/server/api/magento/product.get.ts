import { defineEventHandler, getQuery } from 'h3'
import { useMagentoServer } from '../../../utils/useMagentoServer'

export default defineEventHandler(async (event) => {
  const magento = useMagentoServer(event)
  const query = getQuery(event)

  return magento.products.list(query)
})
