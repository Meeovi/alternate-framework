// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  $meta: {
    name: 'search',
    description: 'Federated search layer for the M Framework',
  },

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
      // Reuses the same env vars adapter-magento's Nuxt module already
      // reads (see packages/adapters/adapter-magento) — no new config to
      // duplicate just to enable federated Magento search.
      magento: {
        enabled: Boolean(process.env.MAGENTO_GRAPHQL_URL),
        endpoint: process.env.MAGENTO_GRAPHQL_URL || '',
        token: process.env.GQL_KEY || '',
      },
      algolia: {
        enabled: Boolean(process.env.ALTERNATE_SEARCH_ALGOLIA_APP_ID && process.env.ALTERNATE_SEARCH_ALGOLIA_API_KEY),
        appId: process.env.ALTERNATE_SEARCH_ALGOLIA_APP_ID || '',
        apiKey: process.env.ALTERNATE_SEARCH_ALGOLIA_API_KEY || '',
        indexName: process.env.ALTERNATE_SEARCH_ALGOLIA_INDEX || 'products',
      },
      meilisearch: {
        enabled: Boolean(process.env.ALTERNATE_SEARCH_MEILISEARCH_HOST),
        host: process.env.ALTERNATE_SEARCH_MEILISEARCH_HOST || '',
        apiKey: process.env.ALTERNATE_SEARCH_MEILISEARCH_API_KEY || '',
        indexUid: process.env.ALTERNATE_SEARCH_MEILISEARCH_INDEX || 'products',
        idField: process.env.ALTERNATE_SEARCH_MEILISEARCH_ID_FIELD || 'id',
      },
      typesense: {
        enabled: Boolean(process.env.ALTERNATE_SEARCH_TYPESENSE_HOST),
        host: process.env.ALTERNATE_SEARCH_TYPESENSE_HOST || '',
        port: parseInt(process.env.ALTERNATE_SEARCH_TYPESENSE_PORT || '443'),
        protocol: process.env.ALTERNATE_SEARCH_TYPESENSE_PROTOCOL || 'https',
        apiKey: process.env.ALTERNATE_SEARCH_TYPESENSE_API_KEY || '',
        collectionName: process.env.ALTERNATE_SEARCH_TYPESENSE_COLLECTION || 'products',
        idField: process.env.ALTERNATE_SEARCH_TYPESENSE_ID_FIELD || 'id',
      },
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
      // AT Protocol (Bluesky) — federates posts + profiles from this
      // deployment's hosted PDS via adapter-federation's AtprotoClient
      // (app.bsky.feed.searchPosts / app.bsky.actor.searchActors). Unlike
      // every provider above, this is on by default (opt out explicitly)
      // since this deployment always has a hosted PDS to search — same
      // "primary backend" default opensearch uses.
      atproto: {
        enabled: process.env.ALTERNATE_SEARCH_ATPROTO_ENABLED !== 'false',
        service: process.env.ALTERNATE_SEARCH_ATPROTO_SERVICE || process.env.ATPROTO_SERVICE || 'https://sky.meeovicms.com',
        // Confirmed live: sky.meeovicms.com's app.bsky.feed.searchPosts /
        // app.bsky.actor.searchActors reject unauthenticated requests
        // (401 AuthMissing) — unlike the public bsky.social AppView.
        // Reuses the same service-account credentials layers/social's
        // useAtprotoClient() bootstrap uses, rather than requiring a
        // second set just for search.
        identifier: process.env.ALTERNATE_SEARCH_ATPROTO_IDENTIFIER || process.env.ATPROTO_IDENTIFIER || '',
        password: process.env.ALTERNATE_SEARCH_ATPROTO_PASSWORD || process.env.ATPROTO_APP_PASSWORD || '',
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
