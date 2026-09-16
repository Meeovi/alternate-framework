import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [],

  $meta: {
    description: 'Business Layer provides functionalities for business operations and services.',
    name: 'business'
  },

  runtimeConfig: {
    public: {}
  },

  build: {
    // @svar-ui/vue-grid ships as ESM but needs transpiling through Nuxt's
    // build pipeline the same way layers/shared does for its own svar-ui
    // usage — without this the seller dashboard grids fail to build.
    transpile: [
      '@svar-ui/vue-grid',
      '@svar-ui/vue-core'
    ]
  },

  compatibilityDate: '2026-02-16'
})
