import {
  defineNuxtConfig
} from 'nuxt/config'

export default defineNuxtConfig({
  $meta: {
    name: 'shared',
  },

  imports: {
    dirs: [
      'composables',
      'app/composables'
    ]
  },

  modules: [
    'vuetify-nuxt-module',
    'nuxt-tiptap-editor',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    'nuxt-security',
  ],

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
        defaultSet: 'fa',
        sets: [{
          name: 'mdi',
          cdn: 'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css'
        }]
      }
    }
  },

  i18n: {
    strategy: "prefix_except_default",
    defaultLocale: "en-GB",
    detectBrowserLanguage: false,
    langDir: "./src/langs/",
    vueI18n: "./config",
    locales: [{
        code: "en-GB",
        language: "en-GB",
        file: "en-GB.ts",
      },
      {
        code: "pl-PL",
        language: "pl-PL",
        file: "pl-PL.ts",
      },
      {
        code: "testde",
        language: "de-DE",
        file: "de-DE.ts",
        localeId: "c19b753b5f2c4bea8ad15e00027802d4",
      },
    ],
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