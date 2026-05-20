// packages/magento/runtime/plugin.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { createMagentoClient } from './server/utils/client'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().magento

  // Client-side usage: admin context only (no customer token here)
  const client = createMagentoClient(config, null as any)

  return {
    provide: {
      magento: client,
    },
  }
})
