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
    // Shared secret used to sign the SSO JWT handed to Coral (server/api/
    // social/coral-token.get.ts) — never exposed to the client. Configured
    // in Coral's own admin panel under Configure > Auth > Single Sign On.
    // Read from process.env explicitly: the .env key is CORAL_SSO_SECRET
    // (no NUXT_ prefix), so Nuxt's automatic runtimeConfig env override
    // (which only matches NUXT_CORAL_SSO_SECRET) never picks it up — same
    // pattern as coralServerURL below.
    coralSsoSecret: process.env.CORAL_SSO_SECRET || '',
    // Optional: Coral's admin issues this alongside the secret when SSO
    // key rotation is in use — sent as the JWT's `kid` header so Coral
    // knows which secret to verify against. Leave unset if Coral's admin
    // only shows a single Secret with no accompanying Key ID.
    coralKeyId: process.env.CORAL_KEY_ID || '',
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
    // Coral (coralproject/talk) replaces Waline as the comments system —
    // Waline had no extension point for external auth, so comments now log
    // in via SSO against layers/auth's session (see coral-token.get.ts).
      coralServerURL: process.env.CORAL_SERVER_URL || '',

      minioEndpoint: process.env.MINIO_ENDPOINT || 'localhost',
      minioPort: process.env.MINIO_PORT || '9000',
      minioUseSSL: process.env.MINIO_USE_SSL === 'true'
    }
  },

  compatibilityDate: '2026-02-16'
})
