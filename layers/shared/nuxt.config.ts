import {
  resolve
} from 'path'
import {
  defineNuxtConfig
} from 'nuxt/config'
import process from 'node:process'
import vuetify, {
  transformAssetUrls
} from 'vite-plugin-vuetify'

const sw = process.env.SW === 'true'
const pwaDevEnabled = process.env.PWA_DEV === 'true'

export default defineNuxtConfig({
  $meta: {
    name: 'shared',
    description: 'Nuxt-specific glue for alternate-* modules',
  },

  alias: {
    '@mframework/ui-forms': resolve(__dirname, '../../packages/modules/ui-forms/src/index.ts'),
    '@mframework/ui-forms/': resolve(__dirname, '../../packages/modules/ui-forms/src/')
  },

  components: {
    dirs: [{
      path: 'app/components',
      pathPrefix: false,
    }]
  },

  modules: [
    '@vueuse/nuxt',
    'nuxt-security',
    '@nuxt/image',
    '@vueuse/motion/nuxt',
    'nuxt-vitalizer',
    '@nuxtjs/seo',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
    '@nuxtjs/turnstile',
    '@nuxtjs/cloudinary',
    '@nuxtjs/leaflet',
    '@nuxt/scripts',
    '@nuxt/fonts'
  ],

  // @ts-ignore - @nuxtjs/fonts module augments this key at runtime
  fonts: {
    priority: ['bunny', 'google'],
  },

  // @ts-ignore - @nuxtjs/seo module augments this key at runtime
  seo: {
    meta: {
      // Basic SEO
      description: `${process.env.NUXT_PUBLIC_SITE_DESCRIPTION || 'Welcome to my awesome site!'}`,
      author: `${process.env.NUXT_PUBLIC_SITE_AUTHOR || 'John Doe'}`,

      // Theme & Color
      themeColor: [{
          content: '#18181b',
          media: '(prefers-color-scheme: dark)'
        },
        {
          content: 'white',
          media: '(prefers-color-scheme: light)'
        },
      ],
      colorScheme: 'dark light',

      // Social Media
      twitterCreator: `${process.env.NUXT_PUBLIC_TWITTER_HANDLE || '@myhandle'}`,
      twitterSite: `${process.env.NUXT_PUBLIC_TWITTER_HANDLE || '@myhandle'}`,

      // App Info
      applicationName: `${process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template'} App`,

      // Nuxt SEO Utils already sets the below tags for you
      ogSiteName: `${process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template'}`,
      ogLocale: 'en_US',
      ogType: 'website',
      ogUrl: 'https://example.com',
      ogTitle: `${process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template'} - ${process.env.NUXT_PUBLIC_SITE_DESCRIPTION || 'Welcome to my awesome site!'}`,

      // Other Nuxt SEO modules handle these
      ogImage: `${process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com'}/og-image.png`,
      robots: 'index, follow',
    }
  },

  // @ts-ignore - @nuxtjs/seo module augments this key at runtime
  site: {
    url: `${process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com'}`,
    name: `${process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template'}`,
    description: `${process.env.NUXT_PUBLIC_SITE_DESCRIPTION || 'Welcome to my awesome site!'}`,
  },

  // @ts-ignore - @nuxtjs/cloudinary module augments this key at runtime
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'nuxt-cloudinary',
  },

  image: {
    cloudinary: {
      baseURL: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'nuxt-cloudinary'}/image/upload/`
    }
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

  scripts: {
    registry: {
      googleAnalytics: {
        trigger: 'onNuxtReady'
      },
      googleAdsense: {
        trigger: 'onNuxtReady'
      },
      metaPixel: {
        trigger: 'onNuxtReady'
      },
      redditPixel: {
        trigger: 'onNuxtReady'
      },
      snapchatPixel: {
        trigger: 'onNuxtReady'
      },
      tiktokPixel: {
        trigger: 'onNuxtReady'
      },
      xPixel: {
        trigger: 'onNuxtReady'
      },
      bingUet: {
        trigger: 'onNuxtReady'
      },
      carbonAds: {
        trigger: 'onNuxtReady',
      },
      googleTagManager: { trigger: 'onNuxtReady' },
      blueskyEmbed: {},
      googleRecaptcha: { trigger: 'onNuxtReady' },
      gravatar: {
        trigger: 'onNuxtReady',
      },
      paypal: {
        trigger: 'onNuxtReady',
      },
      stripe: { trigger: 'onNuxtReady' },
      lemonSqueezy: {
        trigger: 'onNuxtReady',
      },
    }
  },
  // @ts-ignore - routeRules is augmented by Nuxt at runtime
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
      user: '~/auth/currentUser'
    },
    turnstile: {
      // This can be overridden at runtime via the NUXT_TURNSTILE_SECRET_KEY
      // environment variable.
      secretKey: `${process.env.NUXT_TURNSTILE_SECRET_KEY || ''}`,
    },
    notify: {
      sendgridApiKey: process.env.SENDGRID_API_KEY,
      sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL,
      sendgridFromName: process.env.SENDGRID_FROM_NAME,
      twilioSid: process.env.TWILIO_SID,
      twilioToken: process.env.TWILIO_TOKEN,
      twilioFrom: process.env.TWILIO_FROM,
      fcmServerKey: process.env.FCM_SERVER_KEY
    },
    novuSecretKey: process.env.NOVU_SECRET_KEY,

    public: {
      novuAppId: process.env.NUXT_PUBLIC_NOVU_APP_ID,
      novuSubscriberId: process.env.NUXT_PUBLIC_NOVU_SUBSCRIBER_ID,
      segmentWriteKey: process.env.NUXT_PUBLIC_SEGMENT_WRITE_KEY || '',
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
      },
      motion: {
        directives: {
          'pop-bottom': {
            initial: {
              scale: 0,
              opacity: 0,
              y: 100,
            },
            visible: {
              scale: 1,
              opacity: 1,
              y: 0,
            }
          }
        }
      },
    },
  },

  build: {
    transpile: [
      'vuetify',
      '@svar-ui/vue-grid',
      '@svar-ui/vue-editor',
      '@svar-ui/vue-core',
    ],
  },

  vite: {
    optimizeDeps: {
      exclude: ['vuetify'],
    },
    logLevel: 'info',
    plugins: [
      // @ts-ignore
      vuetify({
        autoImport: true
      }),
    ],
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/assets/images/*',
      ]
    },
    compressPublicAssets: true,
  },

  sourcemap: {
    client: 'hidden'
  },

  typescript: {
    tsConfig: {
      include: [
        // this path is relative to the generated .nuxt/tsconfig.json
        '../test/e2e/**/*',
      ],
    },
  },
})