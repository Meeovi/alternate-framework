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
  search: '../../../layers/search',
  commerce: '../../../layers/commerce',
  social: '../../../layers/social',
  ui: '../../../layers/ui-shell'
})

export default defineNuxtConfig({
  extends: layers.extends(),
  alias: {
    ...Object.fromEntries(
      Object.entries(layers.alias('#')).map(([key, value]) => [key, resolve(__dirname, value)])
    ),
    '@mframework/meeovi-forms': resolve(__dirname, '../../../packages/plugins/Marketing-SEO/meeovi-forms/src'),
    '@mframework/meeovi-forms/': resolve(__dirname, '../../../packages/plugins/Marketing-SEO/meeovi-forms/src/') + '/'
  },
  routeRules: {
    '/auth/login': {
      redirect: '/login'
    },
    '/auth/register': {
      redirect: '/register'
    },
    '/auth/reset-password': {
      redirect: '/reset-password'
    },
    '/auth/callback': {
      redirect: '/callback'
    },
    "/directus/**": {
      proxy: {
        to: import.meta.env.DIRECTUS_URL + "/**"
      }
    },
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
      titleTemplate: `%s - ${process.env.NUXT_PUBLIC_SITE_NAME || 'Meeovi'}`,
      meta: [{
          name: 'description',
          content: `${process.env.NUXT_PUBLIC_SITE_DESCRIPTION || 'Meeovi'}`
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
    // ui-shell renders layers/ui-shell/app/layouts/starter.vue as this app's default layout
    uiShell: { layout: 'starter' },
    titleSuffix: `${process.env.NUXT_PUBLIC_SITE_NAME || ' - Meeovi'}`
  },

  css: [
    'assets/web/assets/mobirise-icons2/mobirise2.css',
    'assets/bootstrap/css/bootstrap.min.css',
    'assets/bootstrap/css/bootstrap-grid.min.css',
    'assets/bootstrap/css/bootstrap-reboot.min.css',
    'assets/theme/css/style.css',
    'assets/mobirise/css/mbr-additional.css',
    'assets/styles/social.css',
    'assets/styles/mobile.css',
    'assets/styles/styles.css',
    'assets/styles/search.css',
    'assets/styles/auth.css',
  ],

  modules: [
    // Forms and the page builder, used by the social layer's pages.
    '@mframework/meeovi-forms/module',
    '@mframework/experience-builder',
    '@pinia/nuxt',
    '@sentry/nuxt/module',
    '@mframework/meeovi-newsletter',
    // Optional federated-search backends for layers/search — each is off
    // until its env/config is set.
    '@mframework/search-algolia',
    '@mframework/search-meilisearch',
    '@mframework/search-typesense',
  ],

  pinia: {
    storesDirs: ['/app/stores/**'],
  },

  runtimeConfig: {
    // Server-only — the Directus static token is injected by the
    // /api/cms/** proxy (layers/shared) and never reaches the client.
    directus: {
      token: process.env.NUXTUS_DIRECTUS_STATIC_TOKEN,
    },
    public: {
      // Directus URL only. Client code talks to Directus through the
      // same-origin /api/cms proxy; the token is never serialized here.
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