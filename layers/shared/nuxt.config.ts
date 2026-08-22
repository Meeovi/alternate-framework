import {
  resolve
} from 'path'
import {
  defineNuxtConfig
} from 'nuxt/config'
import process from 'node:process'
import vuetify from 'vite-plugin-vuetify'

const sw = process.env.SW === 'true'
const pwaDevEnabled = process.env.PWA_DEV === 'true'
const newsletterProvider = process.env.NEWSLETTER_PROVIDER || 'mailchimp'

export default defineNuxtConfig({
  $meta: {
    name: 'shared',
    description: 'Nuxt-specific glue for alternate-* modules',
  },

  app: {
    head: {
      script: [{
          innerHTML: `
            window._cyA11yConfig = {
              "iconId": "default",
              "position": { "mobile": "bottom-right", "desktop": "bottom-left" },
              "language": { "default": "en", "selected": [] },
              "modules": { "statement": { "enabled": true, "url": "https://meeovi.com/accessibility" } },
              "keyboard": { "enabled": true, "shortcut": "alt+a" }
            };
          `,
          type: 'text/javascript',
          tagPosition: 'bodyClose'
        },
        {
          src: 'https://cdn-cookieyes.com/widgets/accessibility.js?id=39a5baae-e2fd-4b95-8f39-ffeca39a37da',
          async: true,
          tagPosition: 'bodyClose'
        }
      ]
    }
  },

  alias: {
    '@mframework/meeovi-forms': resolve(__dirname, '../../packages/plugins/meeovi-forms/src/index.ts'),
    '@mframework/meeovi-forms/': resolve(__dirname, '../../packages/plugins/meeovi-forms/src/'),
  },

  components: {
    dirs: [{
      path: 'app/components',
      pathPrefix: false,
    }]
  },

  modules: [
    "nuxt-newsletter",
    '@vueuse/nuxt',
    'nuxt-security',
    '@nuxt/image',
    '@vueuse/motion/nuxt',
    '@tresjs/nuxt',
    '@nuxtjs/seo',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
    '@nuxtjs/turnstile',
    '@nuxtjs/leaflet',
    '@nuxt/scripts',
    '@nuxt/fonts',
    '@nuxtjs/mcp-toolkit',
    '@storefront-ui/nuxt',
    resolve(__dirname, '../../packages/plugins/meeovi-forms/module.ts'),
    resolve(__dirname, '../../packages/plugins/experience-builder/module.ts'),
    'nuxt-skill-hub'
  ],

  // @ts-ignore - nuxt-newsletter module augments this key at runtime
  newsletter: {
    newsletterProvider: {
      apiKey: process.env.NEWSLETTER_API_KEY || '',
      serverPrefix: process.env.MAILCHIMP_SERVER_PREFIX, // Mailchimp only
      audienceId: process.env.MAILCHIMP_AUDIENCE_ID, // Mailchimp only
      component: true,
    }
  },

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

  image: {
    cloudinary: {
      baseURL: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'nuxt-cloudinary'}/image/upload/`
    },
    domains: [
      process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
    ],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    format: ['webp', 'avif'],
    presets: {
      default: {
        modifiers: {
          format: 'webp',
          quality: 80,
        },
      },
    },
    densities: [1, 2, 3],
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
    detectBrowserLanguage: {
      useCookie: true,
      alwaysRedirect: true,
      cookieCrossOrigin: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root', // recommended
    }
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
      googleTagManager: {
        trigger: 'onNuxtReady'
      },
      blueskyEmbed: {},
      googleRecaptcha: {
        trigger: 'onNuxtReady'
      },
      gravatar: {
        trigger: 'onNuxtReady',
      },
      paypal: {
        trigger: 'onNuxtReady',
      },
      stripe: {
        trigger: 'onNuxtReady'
      },
      lemonSqueezy: {
        trigger: 'onNuxtReady',
      },
    }
  },

  leaflet: {
    markerCluster: true
  },

  mcp: {
    name: `${process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template'} MCP`,
    sessions: true,
    route: '/mcp', // Default route for the MCP server
    dir: 'mcp', // Base directory for MCP definitions (relative to server/)
  },

  // @ts-ignore - routeRules is augmented by Nuxt at runtime
  routeRules: {
    '/**': {
      robots: true,
      isr: process.env.NODE_ENV === 'development' ? false : 60,
      headers: {
        'Content-Security-Policy': [
          "media-src 'self' blob: https://stream.mux.com;", // Allows MSE segment blobs
          "worker-src 'self' blob:;", // Allows parsing engines running on workers
          `connect-src 'self' https://*.mux.com ${process.env.DIRECTUS_URL ? process.env.DIRECTUS_URL.replace(/^https?:/, 'https:') : ''};` // Allows Directus API + chunk/manifest data requests
        ].join(' ')
      }
    },
  },

  experimental: {
    viewTransition: true,
  },

  runtimeConfig: {
    redisUrl: process.env.NUXT_REDIS_URL || 'redis://localhost:6379',
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
      // Read by getAssetURL() (layers/shared/app/utils/get-asset-url.ts) to
      // build <img src> URLs for Directus-hosted files in the browser.
      // Vite's import.meta.env only exposes VITE_-prefixed vars, so the
      // previous `import.meta.env.DIRECTUS_URL` read was always undefined,
      // producing broken "undefined/assets/<file>" image URLs site-wide.
      directusUrl: process.env.DIRECTUS_URL || '',
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
        ],
        baseUrl: `${process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com'}`,
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
      exclude: ['vuetify']
    },
    logLevel: 'info',
    plugins: [
      // @ts-ignore
      vuetify({
        autoImport: true
      }),
    ],
    resolve: {
      dedupe: ['vue', 'vue-router']
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
    experimental: {
      asyncContext: true,
    },
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

  vue: {
    compilerOptions: {
      // Instruct Vue to treat all tags starting with 'video-' or 'media-' as custom elements
      isCustomElement: (tag: string) =>
        tag.startsWith('video-') ||
        tag.startsWith('media-') ||
        tag.endsWith('-video')
    }
  },
})