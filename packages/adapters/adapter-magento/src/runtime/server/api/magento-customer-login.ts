import { defineEventHandler, readBody } from 'h3'
import { createMagentoClient } from '../utils/client'
import { useRuntimeConfig } from '#imports'
import { setMagentoCustomerToken, clearMagentoCustomerToken } from '../utils/magentoSession'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody<{ email: string; password: string }>(event)

  const config = useRuntimeConfig().magento
  const client = createMagentoClient(config, event)

  // Get Magento customer token (uses admin context for this call)
  const token = await client.customer.token(email, password)

  if (!token) {
    throw new Error('Failed to obtain Magento customer token')
  }

  setMagentoCustomerToken(event, token)

  return { ok: true }
})
