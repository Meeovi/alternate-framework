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
    // Live discussions (Rocket.Chat, collaborrate.com) — <MeeoviDiscussion>
    '@mframework/meeovi-discussions',
    // Video / audio / radio player on Video.js 10 — <MeeoviPlayer>
    '@mframework/meeovi-player',
    // 1–5 star ratings on everything (replaces likes) — <MeeoviRating>
    '@mframework/meeovi-ratings',
    '@pinia/nuxt',
    '@mframework/meeovi-tables',
    // Per-user integrations: catalog + Install/Uninstall at
    // /dashboard/integrations; installs in Directus `integration_installs`.
    '@mframework/meeovi-integrations',
  ],

  // @mframework/meeovi-tables — <MeeoviTable collection="…" /> and
  // GET /api/tables/:collection. Only these collections are readable; rows
  // come from an installed adapter (adapter-magento: products, orders) or
  // Directus, columns from Directus. Grouped like the workspace sidebar.
  meeoviTables: {
    collections: (() => {
      // Admins read and create/edit/delete everything (all rows); sellers
      // may read the catalog. `fallback: false` = commerce data that only an
      // installed commerce adapter (adapter-magento, …) may provide — the
      // table shows a notice until one does.
      const admin = { roles: ['admin'], editRoles: ['admin'] }
      const catalog = { roles: ['admin', 'seller'], editRoles: ['admin'] }
      const adapterOnly = { ...admin, fallback: false }
      return {
        // Sales — /sales/*
        orders: { label: 'Orders', ...admin, sort: '-id' },
        invoices: { label: 'Invoices', ...admin, sort: '-id' },
        transactions: { label: 'Transactions', ...admin, sort: '-id' },
        payments: { label: 'Payments', ...admin, sort: '-id' },
        shipments: { label: 'Shipments', ...adapterOnly },
        creditmemos: { label: 'Credit Memos', ...adapterOnly },
        billingagreements: { label: 'Billing Agreements', ...adapterOnly },
        // Catalog — /catalog/*
        products: { label: 'Products', ...catalog, sort: 'name' },
        giftcards: { label: 'Gift Cards', ...adapterOnly },
        brands: { label: 'Brands', ...catalog, sort: 'name' },
        departments: { label: 'Departments', ...catalog, sort: 'name' },
        categories: { label: 'Categories', ...catalog, sort: 'name' },
        attributes: { label: 'Attributes', ...catalog },
        // Content — /content/*
        pages: { label: 'Pages', ...admin },
        posts: { label: 'Posts', ...admin },
        spaces: { label: 'Spaces', ...admin },
        lists: { label: 'Lists', ...admin },
        tags: { label: 'Tags', ...admin },
        // Users manage their own (`owner` = better-auth user id, stamped by
        // the server; admins see everyone's). The frontends stay in
        // layers/social (/connect/vibez, /connect/radio, /connect/memories).
        vibez: {
          label: 'Vibez', collection: 'shorts', owner: 'creator_id', ownerName: 'creator', sort: '-date_created',
          fields: ['id', 'name', 'description', 'type', 'status', 'video_url', 'thumbnail_url', 'duration',
            'dateTime', 'age_requirement', 'region', 'creator', 'views', 'date_created'],
          readonlyFields: ['views'],
        },
        radio_stations: {
          label: 'Radio Stations', collection: 'radios', owner: 'creator_id', ownerName: 'creator', sort: 'name',
          fields: ['id', 'name', 'slug', 'status', 'type', 'format', 'satellite', 'internet', 'description', 'creator', 'date_created'],
        },
        // Memories = the user's past posts (Bluesky ones are listed, read-only,
        // on the page itself).
        memories: {
          label: 'Memories', collection: 'posts', owner: 'creator_id', sort: '-date_created',
          filter: { date_created: { _lt: '$NOW' } },
          fields: ['id', 'title', 'content', 'summary', 'status', 'content_type', 'visibility_scope',
            'target_audience', 'date_published', 'views', 'date_created'],
          readonlyFields: ['views'],
          // NOT NULL on posts, not shown in the form
          defaults: { gallery: [] },
        },
        // Customers — /customers/*
        customers: { label: 'Customers', ...adapterOnly },
        online_customers: { label: 'Now Online', ...adapterOnly, unavailableNotice: 'No customers online right now.' },
        customer_groups: { label: 'Customer Groups', ...adapterOnly },
        // Marketing — /marketing/*
        newsletters: { label: 'Newsletters', ...admin },
        promotions: { label: 'Promotions', ...adapterOnly },
        // Seller reviews = messages in product / outlet live discussions
        // (Rocket.Chat; server/plugins/discussion-reviews.ts); read-only.
        reviews: { label: 'Reviews', roles: ['admin'], fallback: false, sort: '-date' },
        // Reports — /reports/*
        // Directus `report` collection (user feedback / reports)
        report: { label: 'Feedback', ...admin, sort: '-date_created' },
        // Stores — /stores/*
        product_attributes: { label: 'Product Attributes', ...catalog },
        warehouses: { label: 'Warehouses', ...adapterOnly },
        sources: { label: 'Inventory Sources', ...adapterOnly },
        terms: { label: 'Terms and Conditions', ...adapterOnly },
      }
    })(),
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
