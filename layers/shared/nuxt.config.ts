import {
  fileURLToPath
} from 'node:url'
import {
  defineNuxtConfig
} from 'nuxt/config'
import process from 'node:process'

const sw = process.env.SW === 'true'
const pwaDevEnabled = process.env.PWA_DEV === 'true'

export default defineNuxtConfig({
  $meta: {
    name: 'shared',
    description: 'Nuxt-specific glue for alternate-* modules',
  },

  css: [],

  modules: [
    'vuetify-nuxt-module',
    '@vueuse/nuxt',
    'nuxt-security',
    '@nuxt/image',
    'nuxt-gtag',
    '@nuxtjs/google-adsense',
    'nuxt-vitalizer',
    '@nuxtjs/seo',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
  ],

  // @ts-ignore - nuxt-gtag module augments this key at runtime
  site: {
    url: `${process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com'}`,
    name: `${process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template'}`,
    description: `${process.env.NUXT_PUBLIC_SITE_DESCRIPTION || 'Welcome to my awesome site!'}`,
  },

  // @ts-ignore - nuxt-gtag module augments this key at runtime
  gtag: {
    enabled: process.env.NODE_ENV === 'production',
    id: process.env.NUXT_PUBLIC_GTAG_ID,
    config: {
      page_title: `${process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template'} - {{ pageTitle }}`,
    },
    initCommands: [
      // Setup up consent mode
      ['consent', 'default', {
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        ad_storage: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500,
      }]
    ],
  },

  pwa: {
    strategies: sw ? 'injectManifest' : 'generateSW',
    srcDir: sw ? 'service-worker' : undefined,
    filename: sw ? 'sw.ts' : undefined,
    registerType: 'autoUpdate',
    manifest: {
      name: process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template',
      short_name: process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template',
      theme_color: '#ffffff',
      icons: [{
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      // you don't need to include this: only for testing purposes
      // if enabling periodic sync for update use 1 hour or so (periodicSyncForUpdates: 3600)
      periodicSyncForUpdates: 20,
    },

    devOptions: {
      enabled: pwaDevEnabled,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },

  security: {
    enabled: process.env.NODE_ENV === 'production',
    rateLimiter: process.env.NODE_ENV === 'production' ? {
      tokensPerInterval: 150,
      interval: 60 * 1000,
      throwError: true,
      headers: true,
    } : false,
    headers: {
      contentSecurityPolicy: false as
      const,
      strictTransportSecurity: {
        maxAge: 0,
      },
      crossOriginOpenerPolicy: false as
      const,
      crossOriginEmbedderPolicy: false as
      const,
      permissionsPolicy: false as
      const,
    },
  },

  vuetify: {
    vuetifyOptions: {
      icons: {
        defaultSet: 'fa',
        sets: [{
          name: 'fa',
          cdn: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@latest/css/all.min.css'
        }, {
          name: 'mdi',
          cdn: 'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css'
        }]
      }
    }
  },

  i18n: {
    locales: [{
        code: 'en',
        language: 'en-US',
        file: 'en.json'
      },
      {
        code: 'fr',
        language: 'fr-FR',
        file: 'fr.json'
      }
    ],
    langDir: 'locales',
    strategy: "prefix_except_default",
    defaultLocale: "en",
    detectBrowserLanguage: false,
  },

  sitemap: {
    sources: [
      '/api/__sitemap__/urls',
    ],
  },

  routeRules: {
    '/**': {
      robots: true,
      isr: process.env.NODE_ENV === 'development' ? false : 60,
    },
  },

  experimental: {
    viewTransition: true,
  },

  runtimeConfig: {
    mframework: {
      auth: '~/auth/authImplementation',
      user: '~/auth/currentUser',
      gateway: '~/gateway/searchGateway'
    },
    public: {
      googleAdsense: {
        id: process.env.GOOGLE_ADSENSE_ID,
        test: process.env.GOOGLE_ADSENSE_TEST_MODE === 'true',
        onPageLoad: false,
        pageLevelAds: false,
      },
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template',
      siteDescription: process.env.NUXT_PUBLIC_SITE_DESCRIPTION || 'Welcome to my awesome site!',
      apiEndpoint: process.env.NUXT_PUBLIC_API_ENDPOINT || 'https://api.example.com',
      i18n: {
        locales: [{
            code: 'en',
            iso: 'en-US',
          },
          {
            code: 'fr',
            iso: 'fr-FR',
          }
        ]
      }
    },
  },

  vite: {
    logLevel: 'info',
    plugins: []
  },

  nitro: {
    prerender: {
      routes: [
        '/assets/images/*',
      ]
    },
    compressPublicAssets: true,
  },

  sourcemap: {
    client: 'hidden'
  }
})