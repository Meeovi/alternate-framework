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
    moduleOptions: {
      includeTransformAssetsUrls: {
        'v-card': [
          'image',
          'prepend-avatar',
          'append-avatar',
        ],
      },
      ssrClientHints: {
        reloadOnFirstRequest: false,
        prefersColorScheme: true,
        prefersColorSchemeOptions: {
          useBrowserThemeOnly: false,
        },
        viewportSize: true,
      },
      // styles: { configFile: 'assets/custom-vuetify.scss' },
    },
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
})