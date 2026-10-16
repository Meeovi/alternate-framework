// https://nuxt.com/docs/api/configuration/nuxt-config

import { fileURLToPath } from 'node:url'

// This layer's app/ dir (no __dirname: this config loads as an ES module)
const layerApp = fileURLToPath(new URL('./app', import.meta.url))

export default defineNuxtConfig({
  $meta: {
    name: 'search',
    description: 'Federated search layer for the M Framework',
  },

  modules: [
    // Headless mode: an app that has its own search UI sets
    //   appConfig: { search: { ui: false } }
    // and keeps only /api/search + the providers. This drops the layer's
    // pages, layouts and (InstantSearch) plugins: the pages/layout import
    // #social / #commerce components, so apps that don't extend those
    // layers can't build them.
    (_options: unknown, nuxt: any) => {
      if (nuxt.options.appConfig?.search?.ui !== false) return
      nuxt.hook('pages:extend', (pages: Array<{ file?: string }>) => {
        for (let i = pages.length - 1; i >= 0; i--) {
          if (pages[i]!.file?.startsWith(`${layerApp}/pages/`)) pages.splice(i, 1)
        }
      })
      nuxt.hook('app:resolve', (app: { layouts: Record<string, { file: string }>, plugins: Array<{ src: string }> }) => {
        for (const [name, layout] of Object.entries(app.layouts)) {
          if (layout.file.startsWith(`${layerApp}/layouts/`)) delete app.layouts[name]
        }
        // The vue-instantsearch plugin only serves the dropped UI — and its
        // algoliasearch-helper dependency breaks production SSR ("Object
        // prototype may only be an Object or null" from its CJS
        // require('events') interop) on every page.
        for (let i = app.plugins.length - 1; i >= 0; i--) {
          if (app.plugins[i]!.src.startsWith(`${layerApp}/plugins/`)) app.plugins.splice(i, 1)
        }
      })
    },
  ],

  devtools: {
    enabled: true
  },

  runtimeConfig: {
    opensearch: {
      host: process.env.ALTERNATE_SEARCH_HOST || 'localhost',
      port: parseInt(process.env.ALTERNATE_SEARCH_PORT || '9200'),
      auth: process.env.ALTERNATE_SEARCH_AUTH || 'admin:admin',
      protocol: process.env.ALTERNATE_SEARCH_PROTOCOL || 'https',
      caCertsPath: process.env.ALTERNATE_SEARCH_CA_CERTS_PATH || '',
      appName: process.env.NUXT_APP_NAME || 'nuxt-app',
      // getOpenSearchIndexName() falls back to appName.toLowerCase() when
      // this is unset, so existing deployments that never set this still
      // work unchanged — but reusing the app's own display name as an
      // index name was never really right (and left ALTERNATE_SEARCH_INDEX
      // below dead: nothing read it). Set this to target a specific index
      // (e.g. a real externally-managed one like Magento's own
      // `magento2_product_<store>_v2`) independent of app branding.
      indexName: process.env.ALTERNATE_SEARCH_INDEX || ''
    },

    // Federated search backends. Each provider is enabled purely by the
    // presence of its connection config, so any combination — OpenSearch
    // alone, OpenSearch + Postgres/Supabase, + MySQL, all three at once —
    // works without a code change. See server/providers/*.ts and
    // server/search/federate.ts for how a new backend gets added.
    searchProviders: {
      opensearch: {
        // OpenSearch is the primary backend; opt out explicitly if a
        // deployment only wants the SQL provider(s).
        enabled: process.env.ALTERNATE_SEARCH_OPENSEARCH_ENABLED !== 'false',
        // /api/search.ts always sends a generic, made-up default field/facet
        // list (title/name/description/brand/category) — fine for an index
        // this app itself populated, wrong for an externally-managed index
        // (e.g. Magento's own catalog-search index, whose field names are
        // Magento's EAV attribute codes, not this shape) whose real schema
        // is deployment-specific. Same override pattern as the postgres/
        // mysql providers' *_COLUMNS: when set, these win over both the
        // request's fields/facets and the generic default.
        searchFields: (process.env.ALTERNATE_SEARCH_OPENSEARCH_FIELDS || '')
          .split(',').map((field) => field.trim()).filter(Boolean),
        facetFields: (process.env.ALTERNATE_SEARCH_OPENSEARCH_FACETS || '')
          .split(',').map((field) => field.trim()).filter(Boolean),
      },
      // Postgres also covers Supabase: point ALTERNATE_SEARCH_PG_URL at the
      // project's Postgres connection string (Supabase project settings ->
      // Database -> Connection string). Falls back to NUXT_DATABASE_URL /
      // DATABASE_URL so apps that already configure a Postgres/Supabase
      // connection for their ORM (Prisma, Drizzle, ...) don't need to
      // duplicate the connection string just to enable search — set
      // ALTERNATE_SEARCH_PG_URL explicitly to point search at a different
      // database than the app's primary one.
      postgres: (() => {
        const connectionString = process.env.ALTERNATE_SEARCH_PG_URL
          || process.env.NUXT_DATABASE_URL
          || process.env.DATABASE_URL
          || ''
        return {
          enabled: Boolean(connectionString),
          connectionString,
          ssl: process.env.ALTERNATE_SEARCH_PG_SSL || (connectionString.includes('supabase') ? 'require' : ''),
          // Certificate validation stays on by default. NOTE this comment
          // previously (wrongly) assumed Supabase's direct Postgres
          // connection uses a publicly-trusted CA — confirmed live via
          // `openssl s_client` that it actually chains to Supabase's own
          // private root ("Supabase Root 2021 CA"), which isn't in Node's
          // default trust store, so full verification fails with
          // "self-signed certificate in certificate chain" out of the box.
          // Set ALTERNATE_SEARCH_PG_SSL_INSECURE=true to accept that
          // (encrypted but unverified — the standard workaround for direct
          // Supabase Postgres connections), or trust Supabase's actual root
          // CA explicitly for full verification instead.
          sslRejectUnauthorized: process.env.ALTERNATE_SEARCH_PG_SSL_INSECURE !== 'true',
          table: process.env.ALTERNATE_SEARCH_PG_TABLE || 'products',
          idColumn: process.env.ALTERNATE_SEARCH_PG_ID_COLUMN || 'id',
          searchColumns: (process.env.ALTERNATE_SEARCH_PG_COLUMNS || 'title,description')
            .split(',').map((column) => column.trim()).filter(Boolean),
        }
      })(),
      mysql: {
        enabled: Boolean(process.env.ALTERNATE_SEARCH_MYSQL_URL),
        connectionString: process.env.ALTERNATE_SEARCH_MYSQL_URL || '',
        table: process.env.ALTERNATE_SEARCH_MYSQL_TABLE || 'products',
        idColumn: process.env.ALTERNATE_SEARCH_MYSQL_ID_COLUMN || 'id',
        searchColumns: (process.env.ALTERNATE_SEARCH_MYSQL_COLUMNS || 'title,description')
          .split(',').map((column) => column.trim()).filter(Boolean),
      },
      // Backend-specific providers live in their plugins, which set their
      // own searchProviders.<name> block and register the provider:
      // algolia / meilisearch / typesense (packages/plugins/Search/search-*),
      // magento (adapter-magento) and atproto (meeovi-atproto).
      // A third, zero-infra SQL option alongside postgres/mysql above —
      // local dev or small deployments that don't want a database server
      // just for search. Uses SQLite's own FTS5 virtual tables when
      // available (see server/providers/database.ts), LIKE otherwise.
      database: {
        enabled: Boolean(process.env.ALTERNATE_SEARCH_SQLITE_PATH),
        filePath: process.env.ALTERNATE_SEARCH_SQLITE_PATH || '',
        table: process.env.ALTERNATE_SEARCH_SQLITE_TABLE || 'products',
        idColumn: process.env.ALTERNATE_SEARCH_SQLITE_ID_COLUMN || 'id',
        searchColumns: (process.env.ALTERNATE_SEARCH_SQLITE_COLUMNS || 'title,description')
          .split(',').map((column) => column.trim()).filter(Boolean),
      },
      // Zero-dependency, in-process fallback — no connection config at all,
      // so it can't be enabled by "presence of config" like every other
      // provider here. Opt in explicitly; seed it via
      // server/providers/memory.ts's seedMemoryIndex()/addMemoryDocuments()
      // (e.g. from a Nitro plugin loading a small catalog once at boot).
      memory: {
        enabled: process.env.ALTERNATE_SEARCH_MEMORY_ENABLED === 'true',
        idField: process.env.ALTERNATE_SEARCH_MEMORY_ID_FIELD || 'id',
        searchFields: (process.env.ALTERNATE_SEARCH_MEMORY_FIELDS || 'title,description')
          .split(',').map((field) => field.trim()).filter(Boolean),
      },
      // Directus CMS content, queried live (server/providers/directus.ts).
      // Off unless an app turns it on, because each app's Directus has its
      // own collections — list them in the app's nuxt.config:
      //   runtimeConfig: { searchProviders: { directus: { enabled: true,
      //     collections: [{ collection: 'characters', type: 'character',
      //       titleField: 'name', descriptionField: 'description',
      //       imageField: 'image', path: '/characters/{slug}' }] } } }
      // Without `collections` it searches Meeovi's spaces/posts/shops. Uses
      // the server-only Directus token when there is one, else Directus's
      // public role.
      directus: {
        enabled: process.env.ALTERNATE_SEARCH_DIRECTUS_ENABLED === 'true',
        collections: [],
      },
      // To add a new backend, prefer a plugin (see
      // packages/plugins/Search/search-algolia): a Nuxt module that sets
      // runtimeConfig.searchProviders.<name> and registers a
      // `SearchProvider` via server/search/registry.ts from a Nitro plugin.
      // Built-ins live in server/providers/<name>.ts + BUILT_IN_PROVIDERS in
      // server/search/federate.ts. No other code needs to change — federate.ts, the /api/search
      // route, and the InstantSearch UI all work against the shared
      // SearchProvider contract in server/providers/types.ts.
    },

    public: {
      // Read by searchBar.vue / resultsComponent.vue to populate the
      // InstantSearch index switcher — previously never declared, so
      // config.public.alternateSearchIndexes was always undefined and the
      // switcher (shown only when indexes.length > 1) could never appear,
      // regardless of env config. 'products' is also the built-in fallback
      // both components already use when this list is empty.
      alternateSearchIndexes: (process.env.NUXT_PUBLIC_SEARCH_INDEXES || 'products')
        .split(',')
        .map((index) => index.trim())
        .filter(Boolean),
    },
  },

  build: {
    // algoliasearch-helper is a transitive CJS dependency of instantsearch.js
    // that vue-instantsearch pulls in internally (not imported directly by
    // our own code). Without it here too, Nitro's dev SSR leaves it
    // externalized to Node's native ESM loader instead of bundling it
    // through Vite, and Node's strict interop can't find a default export
    // on its CJS module.exports — same class of bug as the
    // emoji-mart-vue-fast production fix (see layers/social/services/emoji),
    // but this one hits every page in dev SSR since the instantsearch
    // plugin is registered globally.
    transpile: ['vue-instantsearch', 'instantsearch.js/es', 'algoliasearch-helper'],
  },
})
