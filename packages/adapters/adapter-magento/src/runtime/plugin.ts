// packages/magento/runtime/plugin.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { createMagentoClient } from './server/utils/client'

export default defineNuxtPlugin(() => {
  const runtime = useRuntimeConfig() as any
  const source = runtime.magento || runtime.public?.magento || {}
  const config = {
    provider: source.provider || 'rest',
    url: source.url || source.baseUrl || '',
    token: source.token || source.accessToken || '',
  }

  // Client-side usage: admin context only (no customer token here)
  const client = createMagentoClient(config, null as any)

  return {
    provide: {
      magento: client,
    },
  }
})
