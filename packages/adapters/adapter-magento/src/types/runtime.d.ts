declare module 'nuxt/schema' {
  interface RuntimeConfig {
    magento: {
      endpoint: string
      token: string
    }
  }
}
