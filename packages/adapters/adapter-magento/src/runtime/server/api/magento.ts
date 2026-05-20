import { defineEventHandler, readBody } from 'h3'
import { createMagentoClient } from '../utils/client'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig().magento
  const client = createMagentoClient(config, event)

  const { endpoint, args = [] } = await readBody<{
    endpoint: string
    args?: any[]
  }>(event)

  const target = endpoint
    .split('.')
    .reduce<any>((acc, key) => (acc ? acc[key] : undefined), client)

  if (typeof target !== 'function') {
    throw new Error(`Invalid Magento endpoint: ${endpoint}`)
  }

  return await target(...args)
})
