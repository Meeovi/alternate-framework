declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    mframeworkUi?: {
      theme?: 'light' | 'dark'
      builder?: {
        enabled?: boolean
      }
    }
  }
}

export {}