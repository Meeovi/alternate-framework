// Example Nuxt Plugin for Commerce Layer Integration
// Save this to: layers/commerce/server/plugins/magento.server.ts
// or: your-app/server/plugins/magento.server.ts

import { defineNitroPlugin, useRuntimeConfig } from 'nitropack/runtime'

export default defineNitroPlugin((nitroApp) => {
  // Only initialize if Magento is configured
  const config = useRuntimeConfig()
  
  if (!config.public?.magento?.endpoint) {
    console.warn('Magento adapter not configured - skipping initialization')
    return
  }

  try {
    const { registerMagentoProvidersRuntime } = require('@mframework/adapter-magento')
    
    // Import the registrars from the commerce layer
    // Note: Adjust these imports based on your actual commerce layer exports
    const {
      registerProductProvider,
      registerCategoryProvider,
      registerCartProvider,
    } = require('#imports')

    // Register Magento providers
    registerMagentoProvidersRuntime(
      'magento',
      {
        endpoint: config.public.magento.endpoint,
        accessToken: config.magento?.accessToken,
        timeoutMs: config.magento?.timeoutMs || 5000,
      },
      {
        registerProductProvider,
        registerCategoryProvider,
        registerCartProvider,
      }
    )

    console.log('✓ Magento adapter registered successfully')
  } catch (error) {
    console.error('Failed to register Magento adapter:', error)
  }
})
