import {
  defineNuxtConfig
} from 'nuxt/config'

export default defineNuxtConfig({
  $meta: {
    name: 'shared',
  },

  app: {
    baseURL: '/',
    head: {
      meta: [{
        charset: 'utf-8'
      }, ],
    },
  },

  modules: [
    'nuxt-tiptap-editor',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-security',
    'vuetify-nuxt-module',
    '@nuxt/image',
    '@nuxt/ui'
  ],

  image: {
    provider: process.env.IMAGE_PROVIDER || 'netlify',
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

  vuetify: {
    vuetifyOptions: {
      icons: {
        defaultSet: 'fa-svg',
        sets: [{
          name: 'mdi',
          cdn: 'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css'
        }]
      }
    }
  },

  vite: {
    clearScreen: false,
    define: {
      'process.env.DEBUG': false,
    },
    build: {
      target: 'esnext',
    },
    vue: {
      // template: { transformAssetUrls },
      script: {
        propsDestructure: true,
      },
    },
  },

  routeRules: {
    '/no-ssr': {
      ssr: false
    },
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },

  features: {
    devLogs: false,
  },

  experimental: {
    payloadExtraction: false,
    typedPages: false,
  },

  devtools: {
    enabled: true,
  },

  components: {
    dirs: [{
      path: 'components',
      global: true,
      // Ignore files with bracketed names (e.g. [collection].vue) to avoid
      // generating invalid JS identifiers in the auto-generated components plugin.
      ignore: [
        'app/components/ui/forms/[collection].vue',
        'components/ui/forms/[collection].vue',
        '**/[[]*.vue'
      ]
    }]
  },

  build: {},
})