import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtPage } from '@nuxt/schema'

const isProd = process.env.NODE_ENV === 'production'

// Every page this layer provides needs a signed-in user: mark them here and
// app/middleware/require-login.global.ts enforces it, so a new social page
// is covered without remembering `middleware: 'auth'`. Everything under
// /connect is marked too, whichever layer or app provides the page.
const pagesDir = fileURLToPath(new URL('./app/pages/', import.meta.url))
const pagesDirs = new Set([pagesDir, (() => { try { return realpathSync(pagesDir) + '/' } catch { return pagesDir } })()])
function markSocialPages(pages: NuxtPage[], parentPath = '') {
  for (const page of pages) {
    const path = page.path.startsWith('/') ? page.path : `${parentPath}/${page.path}`
    if (/^\/connect(\/|$)/.test(path) || (page.file && [...pagesDirs].some((dir) => page.file!.startsWith(dir)))) {
      page.meta = { ...page.meta, requiresLogin: true }
    }
    if (page.children?.length) markSocialPages(page.children, path)
  }
}

export default defineNuxtConfig({

  hooks: {
    'pages:extend': markSocialPages,
  },

  modules: [
    '@vueuse/nuxt',
    '@nuxt/image',
    // Federation networks. The federation core is built into this layer
    // (server/utils/federation.ts, /api/social/federation/*); each network
    // is its own plugin that registers itself there.
    //  - meeovi-atproto also signs in the AT Protocol service account
    //    (globalThis.__atprotoClient) — without it useAtprotoClient() throws
    //    "not initialized" whatever ATPROTO_IDENTIFIER/ATPROTO_APP_PASSWORD
    //    are set to.
    '@mframework/meeovi-atproto',
    '@mframework/meeovi-activitypub',
    ...(isProd ? ['nuxt-module-feed'] : [])
  ],
  $meta: {
    description: 'Social Layer provides functionalities for social interactions and networking.',
    name: 'social'
  },

  // The wishlist page was merged into /lists (wishlists are a list type).
  routeRules: {
    '/wishlist': { redirect: '/lists?tab=wishlists' },
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
