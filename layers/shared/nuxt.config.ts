import {
  defineNuxtConfig
} from 'nuxt/config'

export default defineNuxtConfig({
  // Shared Layer Configuration
  // https://nuxt.com/docs/guide/going-further/layers
  $meta: {
    name: 'shared',
    description: 'Shared UI components and utilities',
  },

  modules: [
    'nuxt-tiptap-editor',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-security',
    '@nuxt/image',
    'vuetify-nuxt-module'
  ],

  image: {
    provider: process.env.IMAGE_PROVIDER || 'netlify',
  },

  vuetify: {
    vuetifyOptions: {
      icons: {
        defaultSet: 'fa',
        sets: [{
          name: 'mdi',
          cdn: 'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css'
        }]
      }
    }
  },

  security: {
    headers: {
      contentSecurityPolicy: false,
      strictTransportSecurity: {
        maxAge: 0
      },
      crossOriginOpenerPolicy: false,
      crossOriginEmbedderPolicy: false,
      permissionsPolicy: false
    }
  },

    build: {
    transpile: [
      'vuetify',
    ],
  },

  nitro: {
    prerender: {
      enabled: true,
      crawlLinks: true,
      routes: [],
    },
    compressPublicAssets: true,
  },

  runtimeConfig: {}
})