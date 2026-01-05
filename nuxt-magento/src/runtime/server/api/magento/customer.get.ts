import { defineEventHandler } from 'h3'
import { useMagentoServer } from '../../../utils/useMagentoServer'

export default defineEventHandler(async (event) => {
  const magento = useMagentoServer(event)

  const token = magento.config.customerToken

  if (!token) {
    return { customer: null }
  }

  try {
    const customer = await magento.customer.me(token)
    return { customer }
  } catch {
    return { customer: null }
  }
})
