import {
  useLayers
} from 'nuxt-layers-utils'
import {
  resolve
} from 'path'
import { readdir, rm } from 'node:fs/promises'
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
    '#experience-builder': resolve(__dirname, '../../../packages/plugins/CMS-Content/experience-builder/runtime'),
    '#experience-builder/': resolve(__dirname, '../../../packages/plugins/CMS-Content/experience-builder/runtime') + '/',
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
    // The shared layer's `isr: 60` is a no-op on the node-server preset, so
    // the homepage (~20 Directus calls, ~10s to render) was rebuilt on every
    // hit. Cache it server-side, stale-while-revalidate. `varies: cookie`
    // keys the cache on the request's cookies and passes them into the
    // render: anonymous visitors share one entry, a logged-in user only
    // ever gets the page rendered with their own session.
    '/': {
      swr: 60,
      cache: { varies: ['cookie'] }
    },
  },

  hooks: {
    // Don't emit <link rel="prefetch"> hints. Cloudflare Speed Brain answers
    // requests sent with `Sec-Purpose: prefetch` with an empty 503
    // ("cf-speculation-refused"), and Chrome can then reuse that failed
    // prefetch for the real dynamic import, so the page dies with "Failed
    // to fetch dynamically imported module". The hints also made every
    // visit download ~45 full-size background images up front.
    'build:manifest': (manifest) => {
      for (const file of Object.values(manifest)) {
        file.prefetch = false
      }
    },
    // Client source maps are uploaded to Sentry by its Vite plugin during the
    // client build; Nitro then copies them into .output/public. Remove them
    // here, before Nitro builds its public-asset manifest — Sentry's own
    // filesToDeleteAfterUpload runs after that, leaving manifest entries for
    // deleted files (requests for them 500 instead of 404).
    'nitro:build:public-assets': async (nitro) => {
      const dir = nitro.options.output.publicDir
      const files = await readdir(dir, { recursive: true })
      await Promise.all(files.filter((f) => f.endsWith('.map')).map((f) => rm(resolve(dir, f))))
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
    // ui-shell's default/nolive/settings layouts, `workspace` for the
    // business layer's /workspace pages, `auth` and `search` for those
    // layers' pages; the other apps' layouts stay out of this build
    uiShell: {
      layout: 'default',
      layouts: ['nolive', 'settings', 'workspace', 'auth', 'search'],
      // Directus `navigation` record ids for the /workspace sidebar, one
      // section each (see layers/ui-shell/app/composables/useWorkspaceSidebar.ts)
      workspaceSidebar: [139, 140, 141, 142, 143, 144, 145, 14],
    },
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
    // Forms (JSON Forms on Vuetify) and the page builder, used by the
    // social and business layers' pages.
    '@mframework/meeovi-forms/module',
    '@mframework/experience-builder',
    // Live discussions (Rocket.Chat, collaborrate.com) — <MeeoviDiscussion>
    '@mframework/meeovi-discussions',
    // Video / audio / radio player on Video.js 10 — <MeeoviPlayer>
    '@mframework/meeovi-player',
    // 1–5 star ratings on everything (replaces likes) — <MeeoviRating>
    '@mframework/meeovi-ratings',
    '@pinia/nuxt',
    '@sentry/nuxt/module',
    'adapter-magento/module',
    '@mframework/meeovi-newsletter',
    // Per-user integrations (installed from Meeovi Workspace): list types
    // below only render for users who installed them.
    '@mframework/meeovi-integrations',
    // Admin tables (SVAR DataGrid over the adapters) on /workspace pages — <MeeoviTable>
    '@mframework/meeovi-tables',
    // Sellers' supplier accounts (Printful, CJ) → products under their Webkul seller — /workspace/stores/suppliers
    '@mframework/meeovi-dropshipping',
    // List types rendered by layers/social's /lists/list/[slug] page —
    // drop one to disable that view.
    '@mframework/list-type-tasklist',
    '@mframework/list-type-kanban',
    '@mframework/list-type-habit-tracker',
    // Optional federated-search backends for layers/search — each is off
    // until its env/config is set.
    '@mframework/search-algolia',
    '@mframework/search-meilisearch',
    '@mframework/search-typesense',
  ],

  /*imports: {
    presets: [{
        from: 'alternate-sdk/commerce/adapter',
        imports: [
          ['default', 'useSdkCommerceAdapter']
        ],
      },
      {
        from: 'alternate-sdk/content/adapter',
        imports: [
          ['default', 'useSdkContentAdapter']
        ],
      },
      {
        from: 'alternate-sdk/search/adapter',
        imports: [
          ['default', 'useSdkSearchAdapter']
        ],
      },
      {
        from: 'alternate-sdk/federation/adapter',
        imports: [
          ['default', 'useSdkFederationAdapter']
        ],
      },
    ],
  },*/

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
      magento: {
        // endpoint is the public storefront GraphQL URL — safe to expose.
        // GQL_KEY is NOT a valid Magento customer JWT (attaching it makes
        // Magento reject every request) so the adapter never uses it; it is
        // no longer serialized to the client. See adapter-magento/module.ts.
        endpoint: process.env.MAGENTO_GRAPHQL_URL,
      },
      sentry: {
        dsn: process.env.SENTRY_DSN || process.env.NUXT_PUBLIC_SENTRY_DSN || ''
      },
      // Read by app/layouts/default.vue and nolive.vue for the <meta
      // name="theme-color"> tag. process.env is not populated in the
      // browser bundle — this needs to go through runtimeConfig.public to
      // be readable client-side too.
      appThemeColor: process.env.NUXT_PUBLIC_APP_THEME_COLOR || '#ffffff',
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
      // @fortawesome/fontawesome-svg-core keeps its icon registry
      // (`library`) as module-level state. Externalizing it (rather than
      // letting Nitro inline a separate copy into every SSR route chunk)
      // gives every chunk one real Node module-cache singleton instead of
      // N independent copies, so library.add(fas, far, fab) — called once,
      // in layers/shared's vuetify plugin — actually reaches everything
      // that looks icons up afterwards.
      //
      // @fortawesome/vue-fontawesome is deliberately NOT in this list, even
      // though it's the thing that actually calls findIconDefinition().
      // It has no "exports" map in its package.json (just main/module), so
      // when left external, Node resolves it via require() -> its CJS
      // main (index.js) -> which itself requires('@fortawesome/
      // fontawesome-svg-core') via the "require" condition, landing on
      // fontawesome-svg-core's CJS build (index.js) — a SEPARATE module
      // instance, with its own never-populated `library`, from the ESM
      // build (index.mjs) that vuetify.ts's `import` resolves to. That
      // silent dual-instantiation was the actual cause of "Could not find
      // one or more icon(s)" firing on every SSR request for fas fa-heart
      // and fas/far fa-star (confirmed by patching fontawesome-svg-core's
      // installed findIconDefinition() directly: the patched build's
      // diagnostic never fired even though the warning kept firing,
      // proving the running code wasn't the file being imported by name).
      // Bundling vue-fontawesome instead lets Rollup rewrite its internal
      // require('@fortawesome/fontawesome-svg-core') into the same ESM
      // import every other chunk uses for that external package, so both
      // sides land on one instance.
      external: [
        'playwright-core',
        '@fortawesome/fontawesome-svg-core',
        '@fortawesome/free-solid-svg-icons',
        '@fortawesome/free-regular-svg-icons',
        '@fortawesome/free-brands-svg-icons',
      ],
      // @sentry/node's auto-instrumentation (import-in-the-middle) resolves
      // @swc/helpers/esm/*.js at runtime via the ESM loader hook, which
      // Nitro's static file-trace can't see — it copies the package.json
      // but not the actual helper files, crashing every request in
      // production with ERR_MODULE_NOT_FOUND. Inlining it bundles the
      // helpers directly into entry.mjs instead of relying on a traced
      // node_modules/@swc/helpers at runtime.
      // @algolia/events does `module.exports = EventEmitter` (a function).
      // When left external, Node's real CJS->ESM interop at runtime adds a
      // synthetic `module.exports` key alongside `default` on the namespace
      // object; Rollup's getDefaultExportFromNamespaceIfNotNamed() helper
      // only unwraps `default` when the namespace has exactly one key, so
      // it returns the whole namespace instead of the constructor, and
      // algoliasearch-helper's `inherits(ctor, superCtor)` then crashes on
      // `Object.create(superCtor.prototype)` (prototype is undefined) —
      // breaking every server-rendered page. Inlining it lets Rollup do the
      // CJS interop at build time, which doesn't hit this edge case.
      //
      // @fortawesome/vue-fontawesome: see the long comment on `external`
      // above — explicitly inlined so its own require() of
      // fontawesome-svg-core gets rewritten by Rollup to match the single
      // external import every other chunk uses, instead of resolving to a
      // second, never-populated module instance via Node's CJS "require"
      // export condition.
      inline: ['@swc/helpers', '@algolia/events', '@fortawesome/vue-fontawesome'],
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
    autoInjectServerSentry: 'top-level-import',
    // `sourcemap.client: 'hidden'` only drops the //# sourceMappingURL
    // comment — the .map files were still published under /_nuxt/, i.e.
    // the full original source (comments included) to anyone. They're
    // uploaded to Sentry during the build, then removed from the public
    // output; server maps never leave the server.
    sourcemaps: {
      filesToDeleteAfterUpload: ['.output/public/**/*.map'],
    },
  },

  sourcemap: {
    client: 'hidden'
  },

  ogImage: {
    zeroRuntime: true
  },

  // Nuxt's default payloadExtraction fetches a server-rendered
  // /_payload.json for the target route on every CLIENT-SIDE navigation,
  // instead of letting the destination page's own composables run
  // (fetch data) directly in the browser. For a mostly-static/prerendered
  // site that's a nice win; for this app it was the actual cause of the
  // "redirect after login takes forever" complaint — generating that
  // payload server-side re-runs the exact same slow Directus/commerce
  // SSR fetches (confirmed via a live production build: the /_payload.json
  // request alone took ~12s, matching cold SSR render time almost
  // exactly), and it happens BEFORE the page even starts to transition,
  // so lazy: true on the page's own useAsyncData calls (see e.g.
  // layers/commerce/.../product/latestproducts.vue) never got a chance to
  // help — the client was still stuck waiting on this one JSON request
  // first. Disabling it lets client-side navigations fetch data directly
  // via $fetch from the browser instead, so lazy: true actually works:
  // the page shell renders immediately and each section fills in as its
  // own request resolves.
  experimental: {
    payloadExtraction: false
  }
})