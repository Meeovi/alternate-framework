import {
  useLayers
} from 'nuxt-layers-utils'
import {
  resolve
} from 'path'
import { defineNuxtConfig } from 'nuxt/config'

const layers = useLayers(__dirname, {
  shared: '../../../layers/shared',
  auth: '../../../layers/auth',
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
    // ui-shell renders layers/ui-shell/app/layouts/pixanomy.vue as this app's default layout
    uiShell: { layout: 'pixanomy', layouts: ['auth'] },
    // Header "Media" link + homepage shortcuts: the media library in the Meeovi workspace
    // (layers/business/app/pages/workspace/content/manage-media.vue; sign-in required).
    pixanomy: {
      mediaUrl: 'https://meeovi.com/workspace/content/manage-media',
      appUrl: 'https://app.pixanomy.com',
    },
    titleSuffix: `${process.env.NUXT_PUBLIC_SITE_NAME || ' - Pixanomy'}`
  },

  css: [
    'assets/web/assets/mobirise-icons2/mobirise2.css',
    'assets/bootstrap/css/bootstrap.min.css',
    'assets/bootstrap/css/bootstrap-grid.min.css',
    'assets/bootstrap/css/bootstrap-reboot.min.css',
    'assets/theme/css/style.css',
    'assets/mobirise/css/mbr-additional.css',
    'assets/styles/mobile.css',
    'assets/styles/styles.css'
  ],

  // Vuetify (plugin + vite-plugin-vuetify), PWA and @nuxt/image come from
  // the ui-shell layer.
  modules: [
    '@pinia/nuxt',
    '@sentry/nuxt/module',
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

  runtimeConfig: {
    // Server-only — the Directus static token is injected by the
    // /api/cms/** proxy (layers/shared) and never reaches the client.
    // (Until 2026-11-04 an admin email/password/token sat under `public`
    // here and was serialized into every page.)
    directus: {
      token: process.env.NUXTUS_DIRECTUS_STATIC_TOKEN || '',
    },
    public: {
      // Directus URL only; the browser reads published content anonymously.
      directus: {
        url: process.env.DIRECTUS_URL,
      },
      sentry: {
        dsn: process.env.SENTRY_DSN || process.env.NUXT_PUBLIC_SENTRY_DSN || ''
      }
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
    rollupConfig: {
      external: ['nuxt/app', 'nuxt/config', 'nuxt'],
      // Production only: in `nuxt dev` (Nuxt 4.6 / Nitro 2.13) this splits the
      // dev worker so its entry chunk re-exports `{ default: default }` — a
      // syntax error that 500s every request.
      ...(process.env.NODE_ENV === 'production' ? { output: { inlineDynamicImports: false } } : {}),
      onwarn(warning: {
        code: string;importer: any;ids: any[];message: any
      }, handler: (arg0: any) => void) {
        const isCircular = warning.code === 'CIRCULAR_DEPENDENCY'
        const importer = String(warning.importer || '')
        const ids = Array.isArray(warning.ids) ? warning.ids.join(' ') : ''
        const message = String(warning.message || '')

        const isFrameworkInternal = (
          importer.includes('node_modules/nitropack/') ||
          importer.includes('node_modules/@nuxt/nitro-server/') ||
          importer.includes('node_modules/@nuxt/image/') ||
          ids.includes('node_modules/nitropack/') ||
          ids.includes('node_modules/@nuxt/nitro-server/') ||
          ids.includes('node_modules/@nuxt/image/') ||
          message.includes('virtual:#nitro-internal-virtual/') ||
          message.includes('virtual:#internal/nuxt/island-renderer') ||
          message.includes('virtual:#imports')
        )

        if (isCircular && isFrameworkInternal) {
          return
        }

        handler(warning)
      },
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