import { useRuntimeConfig } from '#imports'
import { createMagentoClient } from '../magentoClient'
import { parseCookies } from 'h3'
import type { H3Event } from 'h3'

export function useMagentoServer(event: H3Event) {
  const config = useRuntimeConfig().magento
  const cookies = parseCookies(event)

  const customerToken = cookies[config.customerTokenCookie || 'magento_customer_token']

  return createMagentoClient({
    ...config,
    customerToken
  })
}

