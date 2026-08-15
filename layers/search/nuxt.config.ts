// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  $meta: {
    name: 'shared',
    description: 'Nuxt-specific glue for alternate-* modules',
  },

  devtools: {
    enabled: true
  },

  // app/components (e.g. ResultCard.vue) use #shared utilities like
  // getAssetURL — matches the same alias declared in layers/social's own
  // nuxt.config.ts, since #shared isn't wired up automatically just by a
  // consumer listing "shared" in its own extends array.
  alias: {
    '#shared': fileURLToPath(new URL('../shared', import.meta.url)),
  },

  runtimeConfig: {
    opensearch: {
      host: process.env.ALTERNATE_SEARCH_HOST || 'localhost',
      port: parseInt(process.env.ALTERNATE_SEARCH_PORT || '9200'),
      auth: process.env.ALTERNATE_SEARCH_AUTH || 'admin:admin',
      protocol: process.env.ALTERNATE_SEARCH_PROTOCOL || 'https',
      caCertsPath: process.env.ALTERNATE_SEARCH_CA_CERTS_PATH || '',
      appName: process.env.NUXT_APP_NAME || 'nuxt-app'
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
      // Reuses the same env vars adapter-magento's Nuxt module already
      // reads (see packages/adapters/adapter-magento) — no new config to
      // duplicate just to enable federated Magento search.
      magento: {
        enabled: Boolean(process.env.MAGENTO_GRAPHQL_URL),
        endpoint: process.env.MAGENTO_GRAPHQL_URL || '',
        token: process.env.GQL_KEY || '',
      },
      // To add a new backend: implement `SearchProvider` in
      // server/providers/<name>.ts, add its config block here (enabled by
      // presence of connection config, same as above), and register the
      // provider in the ALL_PROVIDERS array in server/search/federate.ts.
      // No other code needs to change — federate.ts, the /api/search
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
    transpile: ['vue-instantsearch', 'instantsearch.js/es'],
  },
})
