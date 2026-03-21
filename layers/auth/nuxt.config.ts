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
    }
  }
})