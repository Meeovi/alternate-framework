// Example Nuxt Configuration
// Add this to your nuxt.config.ts

// NOTE: This is an EXAMPLE file for reference only
// Copy this configuration to your actual nuxt.config.ts file

export default defineNuxtConfig({
  runtimeConfig: {
    // Private keys (server-only)
    magento: {
      accessToken: process.env.MAGENTO_ACCESS_TOKEN || '',
      timeoutMs: 5000,
    },
    
    // Public keys (exposed to client)
    public: {
      magento: {
        endpoint: process.env.MAGENTO_GRAPHQL_ENDPOINT || 'https://your-magento-store.com/graphql',
      },
      
      // Configure active commerce providers
      commerce: {
        productProvider: 'magento',
        categoryProvider: 'magento',
        cartProvider: 'magento',
      },
    },
  },
  
  // Add the commerce layer
  extends: [
    './layers/commerce',
  ],
})
