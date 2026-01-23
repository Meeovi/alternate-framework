declare module 'nuxt/schema' {
  interface RuntimeConfig {
    magento: {
      url: string
      store?: string
      adminToken?: string
      customerTokenCookie?: string
      customerToken?: string
    }
  }

  interface PublicRuntimeConfig {
    magento: {
      url: string
      store?: string
    }
  }
}

export {}
