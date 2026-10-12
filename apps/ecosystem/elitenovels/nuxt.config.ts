import {
  useLayers
} from 'nuxt-layers-utils'
import {
  resolve
} from 'path'
import { defineNuxtConfig } from 'nuxt/config'

// Env values copied from a .env file can arrive wrapped in quotes
// ('https://…') or padded with spaces — either makes `new URL()` throw
// "Invalid URL" at runtime, so normalise them here.
const envUrl = (value?: string) => value?.trim().replace(/^(['"])(.*)\1$/, '$2').trim() || undefined

const layers = useLayers(__dirname, {
  shared: '../../../layers/shared',
  auth: '../../../layers/auth',
  search: '../../../layers/search',
  ui: '../../../layers/ui-shell'
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
    // ui-shell renders layers/ui-shell/app/layouts/elitenovels.vue as this app's default layout
    uiShell: { layout: 'elitenovels' },
    // Use layers/search headless: its /api/search + providers, with this
    // app's own search box (components/search/search.vue) and /results page.
    search: { ui: false },
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

  // Vuetify (plugin + vite-plugin-vuetify), PWA, @nuxt/image and
  // @storefront-ui/nuxt come from the ui-shell layer — vuetify-nuxt-module
  // would create a second Vuetify instance on top of it.
  modules: [
    // Live discussions (Rocket.Chat, collaborrate.com) — <MeeoviDiscussion>
    '@mframework/meeovi-discussions',
    // Video / audio / radio player on Video.js 10 — <MeeoviPlayer>
    '@mframework/meeovi-player',
    '@nuxtjs/leaflet',
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
    // Site search (layers/search /api/search) queries the novels Directus
    // live, so new characters/pages are searchable as soon as they're
    // published — no crawler or index to wait for. Every other backend is
    // off: they index Meeovi's catalogue, not Elite Novels content.
    searchProviders: {
      directus: {
        enabled: true,
        collections: [
          { collection: 'characters', type: 'character', titleField: 'name', descriptionField: 'description', imageField: 'image', path: '/characters/{slug}' },
          { collection: 'options', type: 'facet', titleField: 'name', descriptionField: 'description', imageField: 'image', path: '/facet/{slug}' },
          { collection: 'stories', type: 'story', titleField: 'name', descriptionField: 'description', imageField: 'image', path: '/story/{slug}' },
          { collection: 'categories', type: 'category', titleField: 'name', descriptionField: 'description', imageField: 'image', statusField: null, path: '/characters/category/{slug}' },
          { collection: 'pages', type: 'page', titleField: 'name', descriptionField: 'content', imageField: 'image', path: '/{slug}' },
        ],
      },
      opensearch: { enabled: false },
      postgres: { enabled: false },
      mysql: { enabled: false },
      magento: { enabled: false },
      database: { enabled: false },
      memory: { enabled: false },
      atproto: { enabled: false },
    },

    public: {
      // Directus
      directus: {
        url: envUrl(process.env.DIRECTUS_URL),
        nuxtBaseUrl: envUrl(process.env.NUXT_PUBLIC_SITE_URL) || 'http://localhost:3011',
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
