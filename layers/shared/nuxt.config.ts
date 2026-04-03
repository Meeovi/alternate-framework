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
    'vuetify-nuxt-module',
    '@storefront-ui/nuxt',
    '@nuxtjs/seo'
  ],

  site: {
    url: `${process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`,
    name: `${process.env.NUXT_PUBLIC_SITE_NAME || 'My Site'}`
  },

  image: {
    provider: process.env.IMAGE_PROVIDER || 'netlify',
  },

  vuetify: {
    vuetifyOptions: {
      icons: {
        defaultSet: 'fa',
        sets: [{
          name: 'fa',
          cdn: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@latest/css/all.min.css'
        }]
      },
      theme: {
        defaultTheme: 'light',
        themes: {
          light: {},
          dark: {}
        }
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

  runtimeConfig: {},

  build: {
    transpile: ['vuetify', '@fortawesome/vue-fontawesome'],
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [],
    }, 
    compressPublicAssets: true,
  }
})