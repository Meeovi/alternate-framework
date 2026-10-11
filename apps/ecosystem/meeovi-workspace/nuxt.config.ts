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
  business: '../../../layers/business',
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
    // Old Berry (vue-router) paths
    '/auth/login': { redirect: '/login' },
    '/auth/register': { redirect: '/register' },
    '/dashboard/default': { redirect: '/' },
    '/directus/**': {
      proxy: {
        to: import.meta.env.DIRECTUS_URL + '/**'
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
      templateParams: {
        separator: '·'
      },
      htmlAttrs: {
        lang: 'en'
      },
      titleTemplate: `%s - ${process.env.NUXT_PUBLIC_SITE_NAME || 'Meeovi Workspace'}`,
      meta: [{
          name: 'description',
          content: `${process.env.NUXT_PUBLIC_SITE_DESCRIPTION || 'Meeovi Workspace'}`
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
    // ui-shell renders layers/ui-shell/app/layouts/workspace.vue (the Berry
    // admin chrome) as this app's default layout
    uiShell: {
      layout: 'workspace',
      // Directus `navigation` record ids for the sidebar, one section each,
      // in order (see layers/ui-shell/app/composables/useWorkspaceSidebar.ts)
      workspaceSidebar: [139, 140, 141, 142, 143, 144, 145, 14],
    },
    titleSuffix: `${process.env.NUXT_PUBLIC_SITE_NAME || ' - Meeovi Workspace'}`
  },

  css: [
    'assets/styles/social.css',
    'assets/styles/mobile.css',
    'assets/styles/styles.css',
    'assets/styles/search.css',
    'assets/styles/auth.css',
  ],

  modules: [
    '@pinia/nuxt',
    resolve(__dirname, '../../../packages/plugins/Marketing-SEO/meeovi-tables/module.ts'), // TEMP-TABLES
  ],

  // TEMP-TABLES (test config)
  meeoviTables: {
    collections: {
      products: { label: 'Products', access: 'public', fields: ['id', 'sku', 'name', 'price', 'stock', 'status', 'date_created'] },
      spaces: { label: 'Spaces' },
    },
  },

  pinia: {
    storesDirs: ['/app/stores/**'],
  },

  runtimeConfig: {
    public: {
      // Directus URL only. The static token is server-only
      // (runtimeConfig.directus.token, set by layers/commerce) and injected by
      // the /api/cms proxy in layers/shared — it is never sent to the browser.
      directus: {
        url: process.env.DIRECTUS_URL,
      },
    },
  },

  pwa: {
    manifest: {
      name: process.env.NUXT_PUBLIC_SITE_NAME || 'Meeovi Workspace',
      short_name: 'Workspace',
      theme_color: '#5e35b1',
    },
  },

  build: {
    transpile: [
      '@vue/email',
      'vue3-apexcharts',
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

  compatibilityDate: '2026-02-15',

  sourcemap: {
    client: 'hidden'
  },

  ogImage: {
    zeroRuntime: true
  }
})
