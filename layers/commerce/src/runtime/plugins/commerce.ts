import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { createMagentoCommerceAdapter } from '@meeovi/adapter-magento'
import { createCommerceSdk } from '@meeovi/sdk'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const adapter = createMagentoCommerceAdapter({
    endpoint: (config.public as any).meeovi?.magentoEndpoint,
    accessToken: (config as any).meeovi?.magentoAccessToken,
  })

  const commerce = createCommerceSdk({ adapter })

  return {
    provide: {
      commerce,
    },
  }
})