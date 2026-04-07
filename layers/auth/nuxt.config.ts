import {
  defineNuxtConfig
} from 'nuxt/config'

export default defineNuxtConfig({
  $meta: {
    name: 'auth',
    description: 'Auth Layer provides functionalities for user authentication and authorization.',
  },

  runtimeConfig: {
    auth: {
      redirect: {
        login: '/login',
        home: '/'
      }
    },
    public: {
      auth: {
        backend: process.env.NUXT_PUBLIC_AUTH_BACKEND || process.env.AUTH_ADAPTER || 'better-auth',
        cookieName: 'auth-token',
        redirect: {
          login: '/login',
          home: '/'
        }
      } as any
    }
  }
})