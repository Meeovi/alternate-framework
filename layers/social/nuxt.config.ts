import { defineNuxtConfig } from 'nuxt/config'

const isProd = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({

  modules: [
    '@vueuse/nuxt',
    '@nuxt/image',
    // Registers the Nitro server plugin that bootstraps
    // globalThis.__atprotoClient (see AGENTS.md-style notes in
    // @mframework/adapter-federation's runtime/server/atproto.ts) — without
    // this module in `modules`, useAtprotoClient() (used by
    // app/types/service/socialFederation.ts and
    // app/composables/drafts/usePublish.ts) always throws "not
    // initialized", regardless of ATPROTO_IDENTIFIER/ATPROTO_APP_PASSWORD
    // being set.
    '@mframework/adapter-federation/nuxt',
    ...(isProd ? ['nuxt-module-feed'] : [])
  ],
  $meta: {
    description: 'Social Layer provides functionalities for social interactions and networking.',
    name: 'social'
  },

  runtimeConfig: {
    adminKey: '',
    cloudflare: {
      accountId: '',
      namespaceId: '',
      apiToken: ''
    },
    feed: {
      sources: [
        {
          path: '/feed.xml', // The route to your feed.
          type: 'rss2', // Can be: rss2, atom1, json1
          cacheTime: 60 * 15 // How long should the feed be cached
        }
      ]
    },
    mframework: {
      auth: '~/auth/socialAuth',
      user: '~/auth/currentUser'
    },
    public: {
      minioEndpoint: process.env.MINIO_ENDPOINT || 'localhost',
      minioPort: process.env.MINIO_PORT || '9000',
      minioUseSSL: process.env.MINIO_USE_SSL === 'true'
    }
  },

  compatibilityDate: '2026-02-16'
})
