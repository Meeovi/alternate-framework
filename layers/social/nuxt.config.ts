import { realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
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
    // Profiles (pages/u/index.vue) are public: /u/<name> was the auth
    // layer's public page before it was merged in. The page itself asks
    // for sign-in on /u (your own profile).
    const isProfile = /[\\/]pages[\\/]u[\\/]index\.vue$/.test(page.file || '')
    if (!isProfile && (/^\/connect(\/|$)/.test(path) || (page.file && [...pagesDirs].some((dir) => page.file!.startsWith(dir))))) {
      page.meta = { ...page.meta, requiresLogin: true }
    }
    if (page.children?.length) markSocialPages(page.children, path)
  }
}

// The vibe editor's background removal (MediaPipe, app/utils/vibeEditor/)
// loads its WebAssembly from Meeovi itself: the package's wasm/ folder is
// served at /mediapipe/wasm (29 MB, so not copied into the repo), the model
// is public/mediapipe/selfie_segmenter.tflite.
const mediapipeWasm = (() => {
  try {
    return dirname(createRequire(import.meta.url).resolve('@mediapipe/tasks-vision/vision_wasm_internal.js'))
  } catch {
    return null
  }
})()

export default defineNuxtConfig({

  nitro: {
    publicAssets: mediapipeWasm ? [{ dir: mediapipeWasm, baseURL: '/mediapipe/wasm', maxAge: 60 * 60 * 24 * 30 }] : [],
  },

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
    //  - networks members can choose to connect in Settings → Accounts
    //    (layers/social server/utils/federation-connections.ts):
    //    Hubzilla/Streams channels, GNU social accounts, and opt-in
    //    peer-to-peer playback of vibez.
    '@mframework/meeovi-zot',
    '@mframework/meeovi-ostatus',
    '@mframework/meeovi-webtorrent',
    // Members add videos by link (YouTube, Vimeo, Dailymotion, TikTok, PeerTube); adult links refused.
    '@mframework/meeovi-video-bookmarks',
    ...(isProd ? ['nuxt-module-feed'] : [])
  ],
  $meta: {
    description: 'Social Layer provides functionalities for social interactions and networking.',
    name: 'social'
  },

  // The wishlist page was merged into /lists (wishlists are a list type).
  routeRules: {
    '/wishlist': { redirect: '/lists?tab=wishlists' },
    // Profiles are all /u (pages/u/index.vue); /profile was an unfinished copy.
    '/profile': { redirect: '/u' },
    '/profile/**': { redirect: '/u/**' },
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
