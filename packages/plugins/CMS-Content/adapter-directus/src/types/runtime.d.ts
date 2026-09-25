declare module 'nuxt/schema' {
  interface RuntimeConfig {
    directus: {
      url: string | any
      auth: {
        email: string
        password: string
        token: string
        enabled: boolean
        redirect: {
          login: string
          logout: string
          home: string
          resetPassword: string
          callback: string
        }
      }
    }
  }
}
