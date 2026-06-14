import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'

const isProd = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  $meta: {
    name: 'social',
    description: 'Social Layer provides functionalities for social interactions and networking.',
  },

  modules: [
    '@vueuse/nuxt',
    '@nuxt/image',
    ...(isProd ? ['nuxt-module-feed'] : [])
  ],
  
  alias: {
    '#auth': fileURLToPath(new URL('../auth', import.meta.url)),
    '#shared': fileURLToPath(new URL('../shared', import.meta.url)),
    '#social': fileURLToPath(new URL('./', import.meta.url)),
  },

  runtimeConfig: {
    adminKey: '',
    cloudflare: {
      accountId: '',
      namespaceId: '',
      apiToken: '',
    },
      feed: {
    sources: [
      {
        path: "/feed.xml", // The route to your feed.
        type: "rss2", // Can be: rss2, atom1, json1
        cacheTime: 60 * 15, // How long should the feed be cached
      },
    ]
  },  
  mframework: {
    auth: '~/auth/socialAuth',
    user: '~/auth/currentUser',
  },
  public: {
    walineServerURL: process.env.WALINE_SERVER_URL || 'https://waline.vercel.app',

    minioEndpoint: process.env.MINIO_ENDPOINT || 'localhost',
    minioPort: process.env.MINIO_PORT || '9000',
    minioUseSSL: process.env.MINIO_USE_SSL === 'true',
  }
  },

  compatibilityDate: '2026-02-16',
})