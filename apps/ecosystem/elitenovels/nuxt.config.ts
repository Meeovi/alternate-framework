import {
  useLayers
} from 'nuxt-layers-utils'
import {
  resolve
} from 'path'
import { defineNuxtConfig } from 'nuxt/config'
import vuetify from 'vite-plugin-vuetify'

// Env values copied from a .env file can arrive wrapped in quotes
// ('https://…') or padded with spaces — either makes `new URL()` throw
// "Invalid URL" at runtime, so normalise them here.
const envUrl = (value?: string) => value?.trim().replace(/^(['"])(.*)\1$/, '$2').trim() || undefined

const layers = useLayers(__dirname, {
  //shared: '../../../layers/shared',
  //auth: '../../../layers/auth',
})

export default defineNuxtConfig({
  extends: layers.extends(),
  alias: {
    ...Object.fromEntries(
      Object.entries(layers.alias('#')).map(([key, value]) => [key, resolve(__dirname, value)])
    ),
  },

  ssr: true,
  typescript: {
    typeCheck: false
  },

  app: {
    baseURL: '/',
    head: {
      viewport: 'minimum-scale=1, initial-scale=1, width=device-width',
      templateParams: {
        separator: '·'
      },
      htmlAttrs: {
        lang: 'en'
      },
      titleTemplate: `%s - ${process.env.NUXT_PUBLIC_SITE_NAME || 'Pixanomy'}`,
      meta: [{
          name: 'description',
          content: `${process.env.NUXT_PUBLIC_SITE_DESCRIPTION || 'Pixanomy'}`
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1'
        }
      ],
      link: [{
          rel: 'icon',
          href: '/favicon.ico'
        },
        {
          rel: 'apple-touch-icon',
          href: '/icons/apple-touch-icon-180x180.png'
        }
      ]
    }
  },

  appConfig: {
    titleSuffix: `${process.env.NUXT_PUBLIC_SITE_NAME || ' - Pixanomy'}`
  },

  css: [
    'assets/web/assets/mobirise-icons2/mobirise2.css',
    'assets/bootstrap/css/bootstrap.min.css',
    'assets/bootstrap/css/bootstrap-grid.min.css',
    'assets/bootstrap/css/bootstrap-reboot.min.css',
    'assets/theme/css/style.css',
    'assets/mobirise/css/mbr-additional.css',
    '@fortawesome/fontawesome-svg-core/styles.css',
    'assets/styles/mobile.css',
    'assets/styles/styles.css',
  ],

  // Vuetify is set up standalone (app/plugins/vuetify.ts + vite-plugin-vuetify
  // below), like pixanomy-frontend — vuetify-nuxt-module would create a
  // second Vuetify instance on top of it.
  modules: [
    '@nuxt/image',
    '@storefront-ui/nuxt',
    '@nuxtjs/leaflet',
    '@vite-pwa/nuxt',
  ],

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: process.env.NUXT_PUBLIC_SITE_NAME || 'Pixanomy',
      short_name: process.env.NUXT_PUBLIC_SITE_NAME || 'Pixanomy',
      description: process.env.NUXT_PUBLIC_SITE_DESCRIPTION || 'Centralize your digital assets. Store, share, and manage them all in one place.',
      theme_color: process.env.NUXT_PUBLIC_APP_THEME_COLOR || '#ffffff',
      background_color: '#ffffff',
      icons: [
        { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
        { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-192x192.maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-512x512.maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
    },
    client: {
      installPrompt: true,
    },
  },

  image: {
      providers: {
        // Custom wrapper around the built-in cloudinary provider — falls
        // back to serving the original image untransformed when
        // CLOUDINARY_CLOUD_NAME isn't set, instead of 404ing against a
        // placeholder account name. See providers/cloudinary-safe.ts.
        cloudinary: {
          name: 'cloudinary',
          provider: resolve(__dirname, 'providers/cloudinary-safe.ts'),
          options: {
            baseURL: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`,
          },
        },
      },
      domains: [
        envUrl(process.env.NUXT_PUBLIC_SITE_URL) || 'https://example.com',
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

  // Everything under runtimeConfig.public is embedded in every page sent to
  // the browser — never put credentials here. The site reads Directus
  // anonymously, so no admin email/password/token is needed at all.
  runtimeConfig: {
    public: {
      // Directus
      directus: {
        url: envUrl(process.env.DIRECTUS_URL),
        nuxtBaseUrl: envUrl(process.env.NUXT_PUBLIC_SITE_URL) || 'http://localhost:3011',
      },

      disqus: {
        shortname: process.env.NUXT_PUBLIC_DISQUS_SHORTNAME || 'meeovi',
        devShortname: 'meeovi-dev', // fallback (can be fake if you just want placeholder)
        devBaseUrl: 'http://localhost:3000' // used for URL in dev
      },

      meeDirectusUrl: envUrl(process.env.MEE_DIRECTUS_URL) || 'http://localhost:8055',
    },
  },

  build: {
    transpile: [
      '@vue/email',
      'vuetify',
    ]
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    },
    externals: {
      external: ['playwright-core'],
    },
    prerender: {
      failOnError: false,
      ignore: ['/assets/images/*'],
    },
  },

  vite: {
    optimizeDeps: {
      // See layers/shared/nuxt.config.ts's comment on the equivalent
      // option for why vuetify's subpaths are pre-bundled up front: without
      // this, Vite discovers Vuetify's ~800 individual component/composable
      // files one at a time on first use, each triggering a full reload.
      exclude: ['vuetify'],
      include: ['vuetify/components', 'vuetify/directives'],
    },
    plugins: [
      // @ts-ignore
      vuetify({
        autoImport: true,
      }),
    ],
    resolve: {
      alias: {},
    },
  },

  compatibilityDate: '2026-02-15',

  sentry: {
    org: 'meeovi',
    project: 'meeovi',
    autoInjectServerSentry: 'top-level-import'
  },

  sourcemap: {
    client: 'hidden'
  },

  ogImage: {
    zeroRuntime: true
  }
})
