declare module 'nuxt/schema' {
  interface RuntimeConfig {
    mybackend: {
      endpoint: string
      token: string
    }
  }
}
