import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  $meta: {
    name: 'auth',
    description: 'Auth Layer provides functionalities for user authentication and authorization.',
  },

  modules: ['@mframework/alternate-auth'],

  alias: {},

  runtimeConfig: {
    mframework: {
      auth: '~/auth/authContract',
      user: '~/auth/currentUser',
    },  
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
        redirectUserTo: '/login',
        redirectGuestTo: '/login',
      },
      }
    }
  })